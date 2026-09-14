'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import BuyerHeader from '../../../components/BuyerHeader';
import UserAvatar from '../../../components/UserAvatar';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../../lib/api';

function getMessageBody(message) {
  return message?.message || message?.message_text || '';
}

function getSenderId(message) {
  return String(message?.sender_id || '');
}

function sortMessagesByCreatedAt(messageList) {
  return [...messageList].sort((first, second) => {
    const firstTime = Date.parse(first?.created_at || '');
    const secondTime = Date.parse(second?.created_at || '');
    if (Number.isNaN(firstTime)) return Number.isNaN(secondTime) ? 0 : -1;
    if (Number.isNaN(secondTime)) return 1;
    return firstTime - secondTime;
  });
}

const PROPERTY_MESSAGE = 'Hello is this still available?';

function BuyerConversationContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerId = params?.id;
  const propertyId = searchParams.get('propertyId');
  const [user, setUser] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState(() => (propertyId ? PROPERTY_MESSAGE : ''));
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [taggedProperty, setTaggedProperty] = useState(null);
  const [taggedMessage, setTaggedMessage] = useState(null);
  const [messagePropertyImages, setMessagePropertyImages] = useState({});
  const [referencedMessages, setReferencedMessages] = useState({});
  const socketRef = useRef(null);
  const socketRequestsRef = useRef([]);

  const sellerName = sellerInfo?.name || 'Seller';
  const listingSellerId = sellerId;

  useEffect(() => {
    if (!sellerId) return;

    let mounted = true;
    async function loadSellerInformation() {
      const response = await authFetch(`${API_BASE_URL}/buyer/seller/${sellerId}`, { method: 'GET' });
      const data = await response?.json().catch(() => null);
      if (mounted && response?.status === 200 && data?.payload) {
        setSellerInfo(data.payload);
      }
    }

    loadSellerInformation();
    return () => {
      mounted = false;
    };
  }, [sellerId]);

  useEffect(() => {
    if (!propertyId || window.performance.getEntriesByType('navigation')[0]?.type === 'reload') return;

    let mounted = true;
    async function tagPropertyFromNavigation() {
      const response = await authFetch(`${API_BASE_URL}/properties/${propertyId}/image`, { method: 'GET' });
      const data = await response?.json().catch(() => null);
      if (!mounted || response?.status !== 200) return;

      const imageValue = data?.payload?.image_url || '';
      const imageUrl = ['land', 'shop', 'apartment'].includes(imageValue)
        ? `/placeholders/${imageValue}.svg`
        : imageValue;
      setTaggedProperty({ listing_id: propertyId, image_url: imageUrl });
    }

    tagPropertyFromNavigation();
    return () => {
      mounted = false;
    };
  }, [propertyId]);

  function removeTaggedProperty() {
    setTaggedProperty(null);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('propertyId');
    router.replace(`/buyer/messages/${sellerId}${nextParams.toString() ? `?${nextParams}` : ''}`);
  }

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const response = await authFetch(`${API_BASE_URL}/user/me`, { method: 'GET' });
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

  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      if (!listingSellerId || !propertyId) return;
      setLoadingMessages(true);

      const storageKey = `conversation:${listingSellerId}:${propertyId}`;
      const storedMessages = window.sessionStorage.getItem(storageKey);
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          if (mounted) setMessages(Array.isArray(parsedMessages) ? sortMessagesByCreatedAt(parsedMessages) : []);
        } catch {
          window.sessionStorage.removeItem(storageKey);
        }
        if (mounted) setLoadingMessages(false);
        return;
      }

      const userResponse = await authFetch(`${API_BASE_URL}/user/me`, { method: 'GET' });
      const userData = await userResponse?.json().catch(() => null);
      const buyerId = userData?.payload?._id;
      if (!buyerId) {
        if (mounted) setLoadingMessages(false);
        return;
      }

      const query = new URLSearchParams({ buyer_id: String(buyerId), seller_id: String(listingSellerId) });
      const response = await authFetch(`${API_BASE_URL}/conversation?${query}`, { method: 'GET' });
      const data = await response?.json().catch(() => null);
      if (mounted && response?.status === 200) {
        setMessages(Array.isArray(data?.payload) ? sortMessagesByCreatedAt(data.payload) : []);
      }
      if (mounted) setLoadingMessages(false);
    }

    loadMessages();
    return () => {
      mounted = false;
    };
  }, [propertyId, listingSellerId]);

  useEffect(() => {
    const listingIds = [...new Set(messages.map((message) => message.listing_id).filter(Boolean))];
    const messageIds = [...new Set(messages.map((message) => message.message_id).filter(Boolean))];
    if (!listingIds.length && !messageIds.length) return;

    async function loadReferencedData() {
      const propertyResults = await Promise.all(listingIds.map(async (listingId) => {
        const response = await authFetch(`${API_BASE_URL}/properties/${listingId}/image`, { method: 'GET' });
        const data = await response?.json().catch(() => null);
        if (response?.status !== 200) return null;
        const imageValue = data?.payload?.image_url || '';
        const imageUrl = ['land', 'shop', 'apartment'].includes(imageValue)
          ? `/placeholders/${imageValue}.svg`
          : imageValue;
        return [listingId, imageUrl];
      }));
      const messageResults = await Promise.all(messageIds.map(async (messageId) => {
        const response = await authFetch(`${API_BASE_URL}/message/${messageId}/text`, { method: 'GET' });
        const data = await response?.json().catch(() => null);
        return response?.status === 200 && data?.payload ? [messageId, data.payload] : null;
      }));
      setMessagePropertyImages((current) => ({
        ...current,
        ...Object.fromEntries(propertyResults.filter(Boolean)),
      }));
      setReferencedMessages((current) => ({
        ...current,
        ...Object.fromEntries(messageResults.filter(Boolean)),
      }));
    }

    loadReferencedData();
  }, [messages]);

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

  async function handleSendMessage() {
    if (!messageInput.trim() || sendingMessage) return;

    if (!listingSellerId) {
      setFeedback('Seller conversation details are not available yet.');
      return;
    }

    setSendingMessage(true);
    setFeedback('');

    try {
      const conversationId = messages.find((message) => message.conversation_id)?.conversation_id;
      let activeConversationId = conversationId;

      if (!activeConversationId) {
        const conversationQuery = new URLSearchParams({
          buyer_id: String(user?._id || ''),
          seller_id: String(listingSellerId),
        });
        const conversationResponse = await authFetch(
          `${API_BASE_URL}/messages/conversation?${conversationQuery}`,
          { method: 'POST' },
        );
        const conversationData = await conversationResponse?.json().catch(() => null);
        activeConversationId = conversationData?.payload?.conversation_id;
        if (!activeConversationId) {
          setFeedback(conversationData?.message || 'Unable to create conversation.');
          return;
        }
      }

      const payload = {
        message_text: messageInput.trim(),
      };
      if (taggedProperty?.listing_id) payload.listing_id = taggedProperty.listing_id;
      if (taggedMessage?.message_id) payload.message_id = taggedMessage.message_id;

      const savedMessage = await sendMessageSocket(activeConversationId, payload);
      if (savedMessage) {
        const messageToDisplay = savedMessage || {
          sender_id: user?._id,
          message_text: messageInput.trim(),
          conversation_id: activeConversationId,
          created_at: new Date().toISOString(),
        };
        setMessages((current) => sortMessagesByCreatedAt([...current, messageToDisplay]));
        setMessageInput('');
        setTaggedProperty(null);
        setTaggedMessage(null);
      }
    } catch {
      setFeedback('Unable to send message.');
    } finally {
      setSendingMessage(false);
    }
  }

  return (
    <main className="page-shell messages-page">
      <BuyerHeader user={user} loadingUser={loadingUser} />

      <div className="messages-container">
        <aside className="messages-sidebar">
          <h1 className="messages-title">Messages</h1>
          <div className="conversations-list">
            <button type="button" className="conversation-item active">
              <div className="conversation-avatar">{sellerName.charAt(0)}</div>
              <div className="conversation-content">
                <div className="conversation-header">
                  <span className="conversation-name">{sellerName}</span>
                </div>
                <div className="conversation-preview">Property conversation</div>
              </div>
            </button>
          </div>
        </aside>

        <section className="messages-main">
          <div className="conversation-header-bar">
            <div className="conversation-header-info">
              <h2>{sellerName}</h2>
              <p className="listing-ref">Property conversation</p>
            </div>
            <UserAvatar src={sellerInfo?.image_url || ''} name={sellerName} size="md" />
          </div>

          {feedback && <div className="error-message">{feedback}</div>}

          {loadingMessages ? (
            <div className="messages-loading">Loading conversation...</div>
          ) : (
            <div className="messages-thread">
              {messages.length === 0 ? (
                <div className="no-messages">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message._id || index}
                    className={`message-bubble ${getSenderId(message) === String(user?._id) ? 'sent' : 'received'}`}
                  >
                    {message.listing_id && (
                      <div className="message-tagged-item">
                        {messagePropertyImages[message.listing_id] && <img src={messagePropertyImages[message.listing_id]} alt="" aria-hidden="true" />}
                        <span>Tagged property</span>
                      </div>
                    )}
                    {message.message_id && (
                      <div className="message-tagged-item">
                        <span>
                          Tagged message: {getMessageBody(referencedMessages[message.message_id]) || message.message_id}
                        </span>
                      </div>
                    )}
                    <p className="message-text">{getMessageBody(message)}</p>
                    <button
                      type="button"
                      className="message-tag-action"
                      onClick={() => setTaggedMessage({
                        message_id: message.message_id || message._id,
                        text: getMessageBody(message),
                      })}
                    >
                      Tag message
                    </button>
                    <span className="message-time">
                      {message.created_at ? new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="message-input-wrapper">
            {taggedProperty && (
              <div className="message-tag-preview">
                {taggedProperty.image_url && <img src={taggedProperty.image_url} alt="" aria-hidden="true" />}
                <button type="button" onClick={removeTaggedProperty} aria-label="Remove tagged property">x</button>
              </div>
            )}
            {taggedMessage && (
              <div className="message-tag-preview">
                <span>Message: {taggedMessage.text}</span>
                <button type="button" onClick={() => setTaggedMessage(null)} aria-label="Remove tagged message">x</button>
              </div>
            )}
            <input
              type="text"
              className="message-input"
              placeholder="Type message here"
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
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
              &gt;
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function BuyerConversationPage() {
  return (
    <Suspense fallback={<div className="page-shell">Loading...</div>}>
      <BuyerConversationContent />
    </Suspense>
  );
}
