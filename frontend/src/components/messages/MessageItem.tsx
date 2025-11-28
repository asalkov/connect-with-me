import React, { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { deleteMessage, updateMessage } from '../../store/slices/messagesSlice';
import { Message } from '../../services/messages.api';
import { format } from 'date-fns';
import { toast } from '../common/ToastContainer';
import './MessageItem.css';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar: boolean;
  isGrouped: boolean;
  showTimestamp: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage,
  showAvatar,
  isGrouped,
  showTimestamp,
}) => {
  const dispatch = useAppDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const formatTime = (date: string) => {
    try {
      return format(new Date(date), 'HH:mm');
    } catch {
      return '';
    }
  };

  const formatFullTime = (date: string) => {
    try {
      return format(new Date(date), 'MMM d, yyyy HH:mm');
    } catch {
      return '';
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await dispatch(deleteMessage(message.id)).unwrap();
        setShowMenu(false);
        toast.success('Message deleted');
      } catch (error) {
        console.error('Failed to delete message:', error);
        toast.error('Failed to delete message');
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    if (!editContent.trim()) {
      toast.warning('Message cannot be empty');
      return;
    }

    try {
      await dispatch(
        updateMessage({
          id: message.id,
          data: { content: editContent.trim() },
        })
      ).unwrap();
      setIsEditing(false);
      toast.success('Message updated');
    } catch (error) {
      console.error('Failed to update message:', error);
      toast.error('Failed to update message');
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div
      className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'} ${
        isGrouped ? 'grouped' : ''
      }`}
    >
      {!isOwnMessage && showAvatar && (
        <div className="message-avatar">
          <div className="avatar-placeholder">
            {message.senderId.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {!isOwnMessage && !showAvatar && <div className="message-avatar-spacer" />}

      <div className="message-content-wrapper">
        <div className="message-bubble">
          {message.isDeleted ? (
            <p className="deleted-message">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              This message was deleted
            </p>
          ) : isEditing ? (
            <div className="message-edit">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="edit-textarea"
                autoFocus
                rows={3}
              />
              <div className="edit-actions">
                <button className="btn-cancel" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button className="btn-save" onClick={handleSaveEdit}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="message-text">{message.content}</p>
              {message.isEdited && (
                <span className="edited-indicator" title={`Edited ${formatFullTime(message.updatedAt)}`}>
                  (edited)
                </span>
              )}
            </>
          )}

          {showTimestamp && !message.isDeleted && (
            <div className="message-meta">
              <span className="message-time" title={formatFullTime(message.createdAt)}>
                {formatTime(message.createdAt)}
              </span>
              {isOwnMessage && (
                <span className={`message-status status-${message.status}`}>
                  {message.status === 'read' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                      <polyline points="20 6 9 17 4 12" transform="translate(4, 0)"></polyline>
                    </svg>
                  )}
                  {message.status === 'delivered' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                  {message.status === 'sent' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        {isOwnMessage && !message.isDeleted && !isEditing && (
          <div className="message-actions">
            <button
              className="message-menu-btn"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Message options"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
            {showMenu && (
              <>
                <div className="menu-backdrop" onClick={() => setShowMenu(false)} />
                <div className="message-menu">
                  <button onClick={handleEdit} className="menu-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                  </button>
                  <button onClick={handleDelete} className="menu-item danger">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
