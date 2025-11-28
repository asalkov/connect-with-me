import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchConversations, selectConversation } from '../../store/slices/conversationsSlice';
import ConversationItem from './ConversationItem';
import NewConversationModal from './NewConversationModal';
import { ConversationItemSkeleton } from '../common/Skeleton';
import './ConversationsList.css';

const ConversationsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { conversations, loading, selectedConversation } = useAppSelector(
    (state) => state.conversations
  );
  const [showNewConversation, setShowNewConversation] = useState(false);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleSelectConversation = (conversation: any) => {
    dispatch(selectConversation(conversation));
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="conversations-list">
        <div className="conversations-header">
          <h2>Messages</h2>
          <button className="new-conversation-btn" disabled>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
        <div className="conversations-items">
          {[1, 2, 3, 4, 5].map((i) => (
            <ConversationItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="conversations-list">
      <div className="conversations-header">
        <h2>Messages</h2>
        <button
          className="new-conversation-btn"
          onClick={() => setShowNewConversation(true)}
          title="New conversation"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div className="conversations-items">
        {conversations.length === 0 ? (
          <div className="no-conversations">
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
            <p className="no-conversations-title">No conversations yet</p>
            <p className="no-conversations-hint">
              Click the + button to start a new conversation
            </p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversation?.id === conversation.id}
              onClick={() => handleSelectConversation(conversation)}
            />
          ))
        )}
      </div>

      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
      />
    </div>
  );
};

export default ConversationsList;
