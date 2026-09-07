'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../lib/api';
import SellerHeader from '../../components/SellerHeader';
import UserAvatar from '../../components/UserAvatar';

function sortMessagesByCreatedAt(messageList) {
  return [...messageList].sort((first, second) => {
    const firstTime = Date.parse(first?.created_at || '');
    const secondTime = Date.parse(second?.created_at || '');
    if (Number.isNaN(firstTime)) return Number.isNaN(secondTime) ? 0 : -1;
    if (Number.isNaN(secondTime)) return 1;
    return firstTime - secondTime;
  });
}

function MessagesContent() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [buyerInfoById, setBuyerInfoById] = useState({});
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const socketRef = useRef(null);
  const socketRequestsRef = useRef([]);

  // Load user
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const response = await authFetch(`${API_BASE_URL}/user/me`, {
        method: 'GET',
      });

      if (!response) {
        if (mounted) setLoadingUser(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (!mounted) return;

      if (response.status === 200 && data?.payload) {
        setUser(data.payload);
      } else {
        redirectToLogin();
      }

      setLoadingUser(false);
    }

    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  // Load conversations
  useEffect(() => {
    let mounted = true;

    async function loadConversations() {
      const response = await authFetch(`${API_BASE_URL}/seller/messages`, {
        method: 'GET',
      });

      if (!response) {
        if (mounted) setLoadingConversations(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (!mounted) return;

      if (response.status === 200 && data?.payload) {
        setConversations(data.payload);
      } else {
        console.error('Failed to load conversations:', data?.message);
      }

      setLoadingConversations(false);
    }

    loadConversations();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!conversations.length) return;

    let mounted = true;
    async function loadBuyerInformation() {
      const buyerIds = [...new Set(conversations.map((conversation) => conversation.buyer_id).filter(Boolean))];
      const results = await Promise.all(buyerIds.map(async (buyerId) => {
        const response = await authFetch(`${API_BASE_URL}/seller/buyer/${buyerId}`, { method: 'GET' });
        const data = await response?.json().catch(() => null);
        return response?.status === 200 && data?.payload ? [buyerId, data.payload] : null;
      }));
      if (mounted) setBuyerInfoById(Object.fromEntries(results.filter(Boolean)));
    }

    loadBuyerInformation();
    return () => { mounted = false; };
  }, [conversations]);

  useEffect(() => () => {
    socketRequestsRef.current.forEach(({ reject }) => reject(new Error('Message connection closed')));
    socketRequestsRef.current = [];
    socketRef.current?.close();
  }, []);

  function getMessageSocket(conversationId) {
    if (socketRef.current?.readyState === window.WebSocket.OPEN) {
      if (socketRef.current.conversationId === conversationId) {
        return Promise.resolve(socketRef.current);
      }
      socketRef.current.close();
    }

    if (socketRef.current?.readyState === window.WebSocket.CONNECTING) {
      socketRef.current.close();
    }

    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const socket = new window.WebSocket(
        `${protocol}://${window.location.host}${API_BASE_URL}/messages/${encodeURIComponent(conversationId)}/ws`,
      );
      socket.conversationId = conversationId;
      socketRef.current = socket;
      socket.onopen = () => resolve(socket);
      socket.onerror = () => reject(new Error('Message connection failed'));
      socket.onclose = () => {
        socketRequestsRef.current.forEach(({ reject: rejectRequest }) => rejectRequest(new Error('Message connection closed')));
        socketRequestsRef.current = [];
        if (socketRef.current === socket) socketRef.current = null;
      };
    });
  }

  function sendMessageSocket(conversationId, messageBody) {
    return getMessageSocket(conversationId).then((socket) => new Promise((resolve, reject) => {
      const request = { resolve, reject };
      socketRequestsRef.current.push(request);
      socket.onmessage = (event) => {
        const response = JSON.parse(event.data);
        const pendingRequest = socketRequestsRef.current.shift();
        if (!pendingRequest) return;
        if (response.status) pendingRequest.resolve(response.payload);
        else pendingRequest.reject(new Error(response.message || 'Unable to send message.'));
      };
      socket.send(JSON.stringify(messageBody));
    }));
  }

  // Load messages for selected conversation
  useEffect(() => {
    let mounted = true;

    if (!selectedConversation) return;

    async function loadMessages() {
      setLoadingMessages(true);
      const buyerId = selectedConversation.buyer_id;
      const sellerId = selectedConversation.seller_id;

      const response = await authFetch(
        `${API_BASE_URL}/conversation?${new URLSearchParams({ buyer_id: buyerId, seller_id: sellerId })}`,
        { method: 'GET' }
      );

      if (!response) {
        if (mounted) setLoadingMessages(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (!mounted) return;

      if (response.status === 200 && data?.payload) {
        setMessages(sortMessagesByCreatedAt(data.payload));
      } else {
        console.error('Failed to load messages:', data?.message);
      }

      setLoadingMessages(false);
    }

    loadMessages();
    return () => {
      mounted = false;
    };
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    setSendingMessage(true);

    try {
      const conversationId = selectedConversation._id || selectedConversation.conversation_id;
      if (!conversationId) {
        throw new Error('Conversation ID is unavailable');
      }

      const savedMessage = await sendMessageSocket(conversationId, {
        message_text: messageInput.trim(),
      });

      if (savedMessage) {
        setMessages((current) => sortMessagesByCreatedAt([...current, savedMessage]));
        setMessageInput('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const senderName = buyerInfoById[conv.buyer_id]?.name || 'Buyer';
    return senderName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderFooter = () => (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="brand-lockup brand-lockup--footer" aria-label="Home Buddy Connect Limited">
            <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
            <div>
              <div className="brand-name">Home Buddy Connect Limited</div>
              <div className="brand-tagline">Verified housing platform</div>
            </div>
          </div>
          <p>
            A trusted real estate platform for verified property discovery, seller onboarding, and role-based
            dashboards.
          </p>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <ul className="footer-column">
            <li><a href="/contact">Contact</a></li>
            <li><a href="/about-us">About Us</a></li>
            <li><a href="/services">Our Services</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/signup">Register</a></li>
            <li><a href="/support">Support</a></li>
          </ul>
          <ul className="footer-column">
            <li><a href="/terms">Terms</a></li>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/sitemap">Sitemap</a></li>
            <li><a href="/careers">Careers</a></li>
          </ul>
        </nav>
      </div>

      <div className="footer-bottom">
        <div className="footer-copy">© 2026 Home Buddy Connect Limited. All rights reserved.</div>
      </div>
    </footer>
  );

  return (
    <main className="page-shell seller-page-shell messages-page">
      <SellerHeader user={user} loadingUser={loadingUser} />

      <div className="messages-container">
        {/* Conversations Sidebar */}
        <aside className="messages-sidebar">
          <h1 className="messages-title">Messages</h1>

          {/* Search */}
          <div className="messages-search-wrapper">
            <input
              type="text"
              className="messages-search"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Conversation List */}
          {loadingConversations ? (
            <div className="conversations-loading">Loading messages...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="conversations-empty">
              {searchQuery ? 'No conversations match your search' : 'No messages yet'}
            </div>
          ) : (
            <div className="conversations-list">
              {filteredConversations.map((conv) => (
                <button
                  key={conv._id || conv.conversation_id}
                  type="button"
                  className={`conversation-item ${
                    (selectedConversation?._id || selectedConversation?.conversation_id) === (conv._id || conv.conversation_id)
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-avatar">{(buyerInfoById[conv.buyer_id]?.name || conv.buyer_id || 'U').charAt(0)}</div>
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <span className="conversation-name">{buyerInfoById[conv.buyer_id]?.name || 'Buyer'}</span>
                      <span className="conversation-time">
                        {conv.created_at ? new Date(conv.created_at).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }) : ''}
                      </span>
                    </div>
                    <div className="conversation-preview">{conv.last_message || 'No messages yet'}</div>
                    {conv.unread_count > 0 && (
                      <span className="unread-badge">{conv.unread_count}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Message Thread Area */}
        <section className="messages-main">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="conversation-header-bar">
                <div className="conversation-header-info">
                  <h2>{buyerInfoById[selectedConversation.buyer_id]?.name || 'Buyer'}</h2>
                  <p className="listing-ref">{selectedConversation.listing_title || 'Property'}</p>
                </div>
                <UserAvatar
                  src={buyerInfoById[selectedConversation.buyer_id]?.image_url || ''}
                  name={buyerInfoById[selectedConversation.buyer_id]?.name || 'Buyer'}
                  size="md"
                />
              </div>

              {/* Messages Thread */}
              {loadingMessages ? (
                <div className="messages-loading">Loading conversation...</div>
              ) : (
                <div className="messages-thread">
                  {messages.length === 0 ? (
                    <div className="no-messages">No messages yet. Start the conversation!</div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`message-bubble ${
                          msg.sender_id === user?._id || msg.sender_id === user?._id?.toString()
                            ? 'sent'
                            : 'received'
                        }`}
                      >
                        <p className="message-text">{msg.message_text}</p>
                        <span className="message-time">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Message Input */}
              <div className="message-input-wrapper">
                <input
                  type="text"
                  className="message-input"
                  placeholder="Type message here"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  type="button"
                  className="message-send-btn"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendingMessage}
                  title="Send message"
                >
                  ➤
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </section>
      </div>

      {renderFooter()}
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="page-shell">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
