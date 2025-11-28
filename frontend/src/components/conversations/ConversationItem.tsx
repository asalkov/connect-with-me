import React from 'react';
import { Conversation } from '../../services/conversations.api';
import { formatDistanceToNow } from 'date-fns';
import './ConversationItem.css';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  const getConversationName = () => {
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat';
    }
    // For direct conversations, show "Direct Message" for now
    // TODO: Get other participant's name from participants array
    return conversation.name || 'Direct Message';
  };

  const getLastMessageTime = () => {
    if (!conversation.lastMessageAt) return '';
    try {
      return formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const conversationName = getConversationName();

  return (
    <div
      className={`conversation-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="conversation-avatar">
        {conversation.avatarUrl ? (
          <img src={conversation.avatarUrl} alt={conversationName} />
        ) : (
          <div className="avatar-placeholder">
            {getInitials(conversationName)}
          </div>
        )}
        {conversation.type === 'group' && (
          <div className="group-badge">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        )}
      </div>

      <div className="conversation-info">
        <div className="conversation-header">
          <h3 className="conversation-name">{conversationName}</h3>
          {conversation.lastMessageAt && (
            <span className="conversation-time">{getLastMessageTime()}</span>
          )}
        </div>

        <div className="conversation-preview">
          {conversation.description ? (
            <p className="conversation-description">{conversation.description}</p>
          ) : (
            <p className="last-message">
              {conversation.participants.length} participant
              {conversation.participants.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {isSelected && (
        <div className="selected-indicator">
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
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
      )}
    </div>
  );
};

export default ConversationItem;
