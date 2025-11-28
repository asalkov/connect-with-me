import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMessages } from '../../store/slices/messagesSlice';
import MessageItem from './MessageItem';
import { MessageItemSkeleton } from '../common/Skeleton';
import './MessagesList.css';

// Mock mode disabled for this component
const USE_MOCK_DATA = false;
const MOCK_MESSAGES: Record<string, any[]> = {};

interface MessagesListProps {
  conversationId: string;
}

const MessagesList: React.FC<MessagesListProps> = ({ conversationId }) => {
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  
  const { messagesByConversation, loading, cursors, hasMore } = useAppSelector(
    (state) => state.messages
  );
  const { user } = useAppSelector((state) => state.auth);

  // Use mock messages if enabled
  const messages = USE_MOCK_DATA 
    ? (MOCK_MESSAGES[conversationId] || [])
    : (messagesByConversation[conversationId] || []);
  const cursor = cursors[conversationId];
  const canLoadMore = USE_MOCK_DATA ? false : hasMore[conversationId];

  useEffect(() => {
    if (conversationId && messages.length === 0 && !USE_MOCK_DATA) {
      dispatch(fetchMessages({ conversationId, limit: 50 }));
    }
  }, [conversationId, dispatch, messages.length]);

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages, isNearBottom]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Consider "near bottom" if within 100px
    setIsNearBottom(distanceFromBottom < 100);

    // Load more messages when scrolling to top
    if (scrollTop === 0 && canLoadMore && !loading) {
      loadMoreMessages();
    }
  };

  const loadMoreMessages = async () => {
    if (!cursor || loading) return;

    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;

    await dispatch(fetchMessages({ conversationId, limit: 50, cursor }));

    // Maintain scroll position after loading older messages
    if (container) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - previousScrollHeight;
    }
  };

  if (!conversationId) {
    return (
      <div className="messages-empty">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <h3>Select a conversation</h3>
        <p>Choose a conversation from the list to start messaging</p>
      </div>
    );
  }

  return (
    <div className="messages-list">
      {canLoadMore && (
        <div className="load-more-container">
          <button
            className="load-more-btn"
            onClick={loadMoreMessages}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Loading...
              </>
            ) : (
              'Load older messages'
            )}
          </button>
        </div>
      )}

      <div
        className="messages-container"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {loading && messages.length === 0 ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <MessageItemSkeleton key={i} isOwn={i % 2 === 0} />
            ))}
          </>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>No messages yet</p>
            <span>Send a message to start the conversation</span>
          </div>
        ) : (
          <>
            {messages.map((message: any, index: number) => {
              const currentUserId = USE_MOCK_DATA ? 'current-user' : user?.id;
              const isOwnMessage = message.senderId === currentUserId;
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

              // Show avatar if it's the first message or sender changed
              const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
              
              // Group messages from same sender within 5 minutes
              const isGrouped = !!(
                prevMessage &&
                prevMessage.senderId === message.senderId &&
                new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() <
                  5 * 60 * 1000
              );

              // Show timestamp if it's the last in group or time gap is significant
              const showTimestamp =
                !nextMessage ||
                nextMessage.senderId !== message.senderId ||
                new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() >
                  5 * 60 * 1000;

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                  showAvatar={showAvatar}
                  isGrouped={isGrouped}
                  showTimestamp={showTimestamp}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {!isNearBottom && (
        <button
          className="scroll-to-bottom-btn"
          onClick={() => scrollToBottom()}
          title="Scroll to bottom"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessagesList;
