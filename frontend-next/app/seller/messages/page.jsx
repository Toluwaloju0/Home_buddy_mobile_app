'use client';

import { Suspense, useEffect, useState } from 'react';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../lib/api';
import SellerHeader from '../../components/SellerHeader';

function MessagesContent() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      const response = await authFetch(`${API_BASE_URL}/messages/`, {
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

  // Load messages for selected conversation
  useEffect(() => {
    let mounted = true;

    if (!selectedConversation) return;

    async function loadMessages() {
      setLoadingMessages(true);
      const buyerId = selectedConversation._id?.buyer_id || selectedConversation.sender_id;
      const listingId = selectedConversation._id?.listing_id || selectedConversation.listing_id;

      const response = await authFetch(
        `${API_BASE_URL}/messages/${buyerId}/${listingId}`,
        { method: 'GET' }
      );

      if (!response) {
        if (mounted) setLoadingMessages(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (!mounted) return;

      if (response.status === 200 && data?.payload) {
        setMessages(data.payload);
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
      const buyerId = selectedConversation._id?.buyer_id || selectedConversation.sender_id;
      const listingId = selectedConversation._id?.listing_id || selectedConversation.listing_id;
      const listingTitle = selectedConversation.listing_title || 'Property';

      const formData = new FormData();
      formData.append('receiver_id', buyerId);
      formData.append('listing_id', listingId);
      formData.append('listing_title', listingTitle);
      formData.append('message_text', messageInput.trim());

      const response = await authFetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (response.status === 200) {
        setMessageInput('');
        // Reload messages
        const reloadResponse = await authFetch(
          `${API_BASE_URL}/messages/${buyerId}/${listingId}`,
          { method: 'GET' }
        );
        const reloadData = await reloadResponse.json().catch(() => null);
        if (reloadResponse.status === 200) {
          setMessages(reloadData.payload || []);
        }
      } else {
        alert(data?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const senderName = conv.sender_name || 'Unknown';
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
                  key={`${conv._id?.buyer_id}-${conv._id?.listing_id}`}
                  type="button"
                  className={`conversation-item ${
                    selectedConversation?._id?.buyer_id === conv._id?.buyer_id &&
                    selectedConversation?._id?.listing_id === conv._id?.listing_id
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-avatar">{(conv.sender_name || 'U').charAt(0)}</div>
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <span className="conversation-name">{conv.sender_name || 'Unknown'}</span>
                      <span className="conversation-time">
                        {new Date(conv.last_message_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="conversation-preview">{conv.last_message}</div>
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
                  <h2>{selectedConversation.sender_name || 'Unknown Buyer'}</h2>
                  <p className="listing-ref">{selectedConversation.listing_title || 'Property'}</p>
                </div>
                <div className="conversation-header-actions">
                  <button type="button" className="icon-button" title="Call">☎️</button>
                  <button type="button" className="icon-button" title="Video">📹</button>
                  <button type="button" className="icon-button" title="More">⋯</button>
                </div>
              </div>

              {/* Property Info Card */}
              {selectedConversation && (
                <div className="property-info-card">
                  <div className="property-info-section">
                    <span className="property-label">Location</span>
                    <span className="property-value">{selectedConversation.listing_title || 'Property'}</span>
                  </div>
                  <div className="property-info-section">
                    <span className="property-label">Price</span>
                    <span className="property-value">Contact for offer</span>
                  </div>
                  <button type="button" className="view-offer-btn">View Offer</button>
                </div>
              )}

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
