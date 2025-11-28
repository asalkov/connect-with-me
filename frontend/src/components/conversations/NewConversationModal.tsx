import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { createConversation } from '../../store/slices/conversationsSlice';
import { usersApi } from '../../services/users.api';
import { User } from '../../types/user';
import { toast } from '../common/ToastContainer';
import './NewConversationModal.css';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [conversationType, setConversationType] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
      setGroupName('');
      setError(null);
      setConversationType('direct');
    }
  }, [isOpen]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const response = await usersApi.searchUsers({
          query: searchQuery,
          limit: 10,
        });
        setSearchResults(response.users || []);
      } catch (err: any) {
        console.error('Search error:', err);
        setError('Failed to search users');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectUser = (user: User) => {
    if (conversationType === 'direct') {
      setSelectedUsers([user]);
      setSearchQuery('');
      setSearchResults([]);
    } else {
      if (!selectedUsers.find((u) => u.id === user.id)) {
        setSelectedUsers([...selectedUsers, user]);
        setSearchQuery('');
        setSearchResults([]);
      }
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (conversationType === 'group' && !groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await dispatch(
        createConversation({
          type: conversationType,
          participantIds: selectedUsers.map((u) => u.id),
          name: conversationType === 'group' ? groupName.trim() : undefined,
        })
      ).unwrap();

      toast.success('Conversation created successfully');
      onClose();
    } catch (err: any) {
      console.error('Create conversation error:', err);
      const errorMessage = err.message || 'Failed to create conversation';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTypeChange = (type: 'direct' | 'group') => {
    setConversationType(type);
    if (type === 'direct' && selectedUsers.length > 1) {
      setSelectedUsers([selectedUsers[0]]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content new-conversation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Conversation</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="conversation-type-selector">
            <button
              className={`type-btn ${conversationType === 'direct' ? 'active' : ''}`}
              onClick={() => handleTypeChange('direct')}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Direct Message
            </button>
            <button
              className={`type-btn ${conversationType === 'group' ? 'active' : ''}`}
              onClick={() => handleTypeChange('group')}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Group Chat
            </button>
          </div>

          {conversationType === 'group' && (
            <div className="form-group">
              <label htmlFor="groupName">Group Name</label>
              <input
                id="groupName"
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="group-name-input"
                maxLength={50}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="userSearch">
              {conversationType === 'direct' ? 'Search user' : 'Add participants'}
            </label>
            <div className="search-input-wrapper">
              <svg
                className="search-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                id="userSearch"
                type="text"
                placeholder="Search by name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="user-search-input"
              />
              {isSearching && <div className="search-spinner"></div>}
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="selected-users">
              <label>Selected ({selectedUsers.length})</label>
              <div className="selected-users-list">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="selected-user-tag">
                    <span className="user-name">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username}
                    </span>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="remove-user-btn"
                      aria-label={`Remove ${user.username}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery.length >= 2 && (
            <div className="search-results">
              {isSearching ? (
                <div className="search-results-loading">
                  <div className="spinner"></div>
                  <p>Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => {
                  const isSelected = selectedUsers.some((u) => u.id === user.id);
                  return (
                    <div
                      key={user.id}
                      className={`user-result ${isSelected ? 'selected' : ''}`}
                      onClick={() => !isSelected && handleSelectUser(user)}
                    >
                      <div className="user-avatar">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="user-info">
                        <p className="user-name">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.username}
                        </p>
                        <p className="user-username">@{user.username}</p>
                      </div>
                      {isSelected && (
                        <svg
                          className="check-icon"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="no-results">
                  <p>No users found</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="error-message">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isCreating}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleCreateConversation}
            disabled={selectedUsers.length === 0 || isCreating}
          >
            {isCreating ? (
              <>
                <div className="btn-spinner"></div>
                Creating...
              </>
            ) : (
              'Create Conversation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
