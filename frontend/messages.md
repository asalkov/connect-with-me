# Frontend Messages & Conversations Implementation Plan

## Overview
This document outlines the step-by-step implementation plan for adding conversations and messaging functionality to the frontend React application.

---

## 🎯 Phase 1: Core Services & API Integration (2-3 hours)

### Checkpoint 1.1: Create Conversation Service
**Time**: 45 minutes  
**Files**: `src/services/conversations.service.ts` (NEW)

**Tasks**:
1. Create conversation service with API methods:
```typescript
import api from './api';

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  avatarUrl?: string;
  participants: string[];
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationDto {
  type: 'direct' | 'group';
  participantIds: string[];
  name?: string;
  description?: string;
}

class ConversationsService {
  async getConversations(limit?: number): Promise<Conversation[]> {
    const response = await api.get('/conversations', { params: { limit } });
    return response.data.conversations;
  }

  async getConversation(id: string): Promise<Conversation> {
    const response = await api.get(`/conversations/${id}`);
    return response.data.conversation;
  }

  async createConversation(data: CreateConversationDto): Promise<Conversation> {
    const response = await api.post('/conversations', data);
    return response.data.conversation;
  }

  async updateConversation(
    id: string,
    data: { name?: string; description?: string; avatarUrl?: string }
  ): Promise<Conversation> {
    const response = await api.put(`/conversations/${id}`, data);
    return response.data.conversation;
  }

  async deleteConversation(id: string): Promise<void> {
    await api.delete(`/conversations/${id}`);
  }

  async addParticipant(conversationId: string, userId: string): Promise<void> {
    await api.post(`/conversations/${conversationId}/participants`, { userId });
  }

  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    await api.delete(`/conversations/${conversationId}/participants/${userId}`);
  }

  async leaveConversation(conversationId: string): Promise<void> {
    await api.post(`/conversations/${conversationId}/leave`);
  }
}

export default new ConversationsService();
```

**Validation**:
- [ ] Service created with all methods
- [ ] TypeScript types defined
- [ ] No compilation errors

---

### Checkpoint 1.2: Create Messages Service
**Time**: 45 minutes  
**Files**: `src/services/messages.service.ts` (NEW)

**Tasks**:
1. Create messages service:
```typescript
import api from './api';

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  senderId: string;
  conversationId: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageDto {
  content: string;
  type?: 'text' | 'image' | 'file';
  conversationId: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
}

class MessagesService {
  async getMessages(
    conversationId: string,
    limit?: number,
    cursor?: string
  ): Promise<{ messages: Message[]; nextCursor?: string }> {
    const response = await api.get(`/messages/${conversationId}`, {
      params: { limit, cursor },
    });
    return response.data;
  }

  async sendMessage(data: CreateMessageDto): Promise<Message> {
    const response = await api.post('/messages', data);
    return response.data.message;
  }

  async updateMessage(
    id: string,
    data: { content: string }
  ): Promise<Message> {
    const response = await api.put(`/messages/${id}`, data);
    return response.data.message;
  }

  async deleteMessage(id: string): Promise<void> {
    await api.delete(`/messages/${id}`);
  }

  async markAsRead(messageId: string): Promise<void> {
    await api.post(`/messages/${messageId}/read`);
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    await api.post(`/messages/${conversationId}/read-all`);
  }
}

export default new MessagesService();
```

**Validation**:
- [ ] Service created with all methods
- [ ] Pagination support included
- [ ] No compilation errors

---

### Checkpoint 1.3: Create Users Service
**Time**: 30 minutes  
**Files**: `src/services/users.service.ts` (NEW)

**Tasks**:
1. Create users service for searching users:
```typescript
import api from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  status: string;
  bio?: string;
}

class UsersService {
  async searchUsers(query: string, limit?: number): Promise<User[]> {
    const response = await api.get('/users/search', {
      params: { query, limit },
    });
    return response.data.users;
  }

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data.user;
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data.user;
  }

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const response = await api.put('/users/me', data);
    return response.data.user;
  }
}

export default new UsersService();
```

**Validation**:
- [ ] Service created
- [ ] Search functionality included
- [ ] No compilation errors

---

## 🎯 Phase 2: State Management (1-2 hours)

### Checkpoint 2.1: Create Conversations Store
**Time**: 45 minutes  
**Files**: `src/store/conversationsSlice.ts` (NEW)

**Tasks**:
1. Create Redux slice for conversations:
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import conversationsService, { Conversation } from '../services/conversations.service';

interface ConversationsState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  loading: boolean;
  error: string | null;
}

const initialState: ConversationsState = {
  conversations: [],
  selectedConversation: null,
  loading: false,
  error: null,
};

export const fetchConversations = createAsyncThunk(
  'conversations/fetchAll',
  async (limit?: number) => {
    return await conversationsService.getConversations(limit);
  }
);

export const fetchConversation = createAsyncThunk(
  'conversations/fetchOne',
  async (id: string) => {
    return await conversationsService.getConversation(id);
  }
);

export const createConversation = createAsyncThunk(
  'conversations/create',
  async (data: { type: 'direct' | 'group'; participantIds: string[]; name?: string }) => {
    return await conversationsService.createConversation(data);
  }
);

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    selectConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.selectedConversation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch conversations';
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.selectedConversation = action.payload;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload);
        state.selectedConversation = action.payload;
      });
  },
});

export const { selectConversation, clearError } = conversationsSlice.actions;
export default conversationsSlice.reducer;
```

**Validation**:
- [ ] Redux slice created
- [ ] Async thunks defined
- [ ] State properly typed

---

### Checkpoint 2.2: Create Messages Store
**Time**: 45 minutes  
**Files**: `src/store/messagesSlice.ts` (NEW)

**Tasks**:
1. Create Redux slice for messages:
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import messagesService, { Message } from '../services/messages.service';

interface MessagesState {
  messagesByConversation: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
  cursors: Record<string, string | undefined>;
}

const initialState: MessagesState = {
  messagesByConversation: {},
  loading: false,
  error: null,
  cursors: {},
};

export const fetchMessages = createAsyncThunk(
  'messages/fetch',
  async ({ conversationId, limit, cursor }: { conversationId: string; limit?: number; cursor?: string }) => {
    return await messagesService.getMessages(conversationId, limit, cursor);
  }
);

export const sendMessage = createAsyncThunk(
  'messages/send',
  async (data: { content: string; conversationId: string }) => {
    return await messagesService.sendMessage(data);
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/delete',
  async (id: string) => {
    await messagesService.deleteMessage(id);
    return id;
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const conversationId = action.payload.conversationId;
      if (!state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId] = [];
      }
      state.messagesByConversation[conversationId].push(action.payload);
    },
    clearMessages: (state, action: PayloadAction<string>) => {
      delete state.messagesByConversation[action.payload];
      delete state.cursors[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId } = action.meta.arg;
        const { messages, nextCursor } = action.payload;
        
        if (!state.messagesByConversation[conversationId]) {
          state.messagesByConversation[conversationId] = [];
        }
        
        // Prepend older messages (for pagination)
        state.messagesByConversation[conversationId] = [
          ...messages.reverse(),
          ...state.messagesByConversation[conversationId],
        ];
        
        state.cursors[conversationId] = nextCursor;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const conversationId = action.payload.conversationId;
        if (!state.messagesByConversation[conversationId]) {
          state.messagesByConversation[conversationId] = [];
        }
        state.messagesByConversation[conversationId].push(action.payload);
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        Object.keys(state.messagesByConversation).forEach((conversationId) => {
          state.messagesByConversation[conversationId] = state.messagesByConversation[
            conversationId
          ].filter((msg) => msg.id !== messageId);
        });
      });
  },
});

export const { addMessage, clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
```

**Validation**:
- [ ] Messages slice created
- [ ] Pagination support included
- [ ] Real-time message support ready

---

### Checkpoint 2.3: Update Store Configuration
**Time**: 15 minutes  
**Files**: `src/store/index.ts`

**Tasks**:
1. Add new slices to store:
```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import conversationsReducer from './conversationsSlice';
import messagesReducer from './messagesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    conversations: conversationsReducer,
    messages: messagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Validation**:
- [ ] Store updated
- [ ] No TypeScript errors
- [ ] App still compiles

---

## 🎯 Phase 3: UI Components - Conversations List (2-3 hours)

### Checkpoint 3.1: Create ConversationsList Component
**Time**: 1 hour  
**Files**: `src/components/conversations/ConversationsList.tsx` (NEW)

**Tasks**:
1. Create conversations list component:
```tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations, selectConversation } from '../../store/conversationsSlice';
import { RootState, AppDispatch } from '../../store';
import ConversationItem from './ConversationItem';
import './ConversationsList.css';

const ConversationsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, loading, selectedConversation } = useSelector(
    (state: RootState) => state.conversations
  );

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleSelectConversation = (conversation: any) => {
    dispatch(selectConversation(conversation));
  };

  if (loading) {
    return <div className="conversations-loading">Loading conversations...</div>;
  }

  return (
    <div className="conversations-list">
      <div className="conversations-header">
        <h2>Messages</h2>
        <button className="new-conversation-btn">+</button>
      </div>
      <div className="conversations-items">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <p>No conversations yet</p>
            <p className="hint">Start a new conversation to get started</p>
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
    </div>
  );
};

export default ConversationsList;
```

**Validation**:
- [ ] Component renders
- [ ] Fetches conversations on mount
- [ ] Selection works

---

### Checkpoint 3.2: Create ConversationItem Component
**Time**: 45 minutes  
**Files**: `src/components/conversations/ConversationItem.tsx` (NEW)

**Tasks**:
1. Create individual conversation item:
```tsx
import React from 'react';
import { Conversation } from '../../services/conversations.service';
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
    // For direct conversations, show other participant's name
    return 'Direct Message'; // TODO: Get participant name
  };

  const getLastMessageTime = () => {
    if (!conversation.lastMessageAt) return '';
    return formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true });
  };

  return (
    <div
      className={`conversation-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="conversation-avatar">
        {conversation.avatarUrl ? (
          <img src={conversation.avatarUrl} alt={getConversationName()} />
        ) : (
          <div className="avatar-placeholder">
            {getConversationName().charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="conversation-info">
        <div className="conversation-header">
          <h3 className="conversation-name">{getConversationName()}</h3>
          <span className="conversation-time">{getLastMessageTime()}</span>
        </div>
        <div className="conversation-preview">
          <p className="last-message">Last message preview...</p>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
```

**Validation**:
- [ ] Item displays correctly
- [ ] Selection styling works
- [ ] Time formatting works

---

### Checkpoint 3.3: Create NewConversation Modal
**Time**: 1 hour  
**Files**: `src/components/conversations/NewConversationModal.tsx` (NEW)

**Tasks**:
1. Create modal for starting new conversations:
```tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createConversation } from '../../store/conversationsSlice';
import { AppDispatch } from '../../store';
import usersService from '../../services/users.service';
import './NewConversationModal.css';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [conversationType, setConversationType] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState('');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const users = await usersService.searchUsers(query);
      setSearchResults(users);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectUser = (user: any) => {
    if (conversationType === 'direct') {
      setSelectedUsers([user]);
    } else {
      if (!selectedUsers.find((u) => u.id === user.id)) {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) return;

    await dispatch(
      createConversation({
        type: conversationType,
        participantIds: selectedUsers.map((u) => u.id),
        name: conversationType === 'group' ? groupName : undefined,
      })
    );

    onClose();
    setSelectedUsers([]);
    setSearchQuery('');
    setGroupName('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Conversation</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="conversation-type-selector">
            <button
              className={conversationType === 'direct' ? 'active' : ''}
              onClick={() => setConversationType('direct')}
            >
              Direct Message
            </button>
            <button
              className={conversationType === 'group' ? 'active' : ''}
              onClick={() => setConversationType('group')}
            >
              Group Chat
            </button>
          </div>

          {conversationType === 'group' && (
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="group-name-input"
            />
          )}

          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="user-search-input"
          />

          <div className="selected-users">
            {selectedUsers.map((user) => (
              <span key={user.id} className="selected-user-tag">
                {user.username}
                <button onClick={() => setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id))}>
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="search-results">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="user-result"
                onClick={() => handleSelectUser(user)}
              >
                <div className="user-avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} />
                  ) : (
                    <div className="avatar-placeholder">{user.username.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div className="user-info">
                  <p className="user-name">{user.firstName} {user.lastName}</p>
                  <p className="user-username">@{user.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleCreateConversation}
            disabled={selectedUsers.length === 0}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
```

**Validation**:
- [ ] Modal opens/closes
- [ ] User search works
- [ ] Conversation creation works

---

## 🎯 Phase 4: UI Components - Messages (3-4 hours)

### Checkpoint 4.1: Create MessagesList Component
**Time**: 1.5 hours  
**Files**: `src/components/messages/MessagesList.tsx` (NEW)

**Tasks**:
1. Create messages list with infinite scroll:
```tsx
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages } from '../../store/messagesSlice';
import { RootState, AppDispatch } from '../../store';
import MessageItem from './MessageItem';
import './MessagesList.css';

interface MessagesListProps {
  conversationId: string;
}

const MessagesList: React.FC<MessagesListProps> = ({ conversationId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messagesByConversation, loading, cursors } = useSelector(
    (state: RootState) => state.messages
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const messages = messagesByConversation[conversationId] || [];
  const cursor = cursors[conversationId];

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessages({ conversationId, limit: 50 }));
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMoreMessages = () => {
    if (cursor && !loading) {
      dispatch(fetchMessages({ conversationId, limit: 50, cursor }));
    }
  };

  if (!conversationId) {
    return (
      <div className="messages-empty">
        <p>Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="messages-list">
      {cursor && (
        <button className="load-more-btn" onClick={loadMoreMessages} disabled={loading}>
          {loading ? 'Loading...' : 'Load more messages'}
        </button>
      )}
      
      <div className="messages-container">
        {messages.map((message, index) => {
          const isOwnMessage = message.senderId === user?.id;
          const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
          
          return (
            <MessageItem
              key={message.id}
              message={message}
              isOwnMessage={isOwnMessage}
              showAvatar={showAvatar}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessagesList;
```

**Validation**:
- [ ] Messages display correctly
- [ ] Auto-scroll to bottom works
- [ ] Load more pagination works

---

### Checkpoint 4.2: Create MessageItem Component
**Time**: 1 hour  
**Files**: `src/components/messages/MessageItem.tsx` (NEW)

**Tasks**:
1. Create individual message component:
```tsx
import React, { useState } from 'react';
import { Message } from '../../services/messages.service';
import { format } from 'date-fns';
import './MessageItem.css';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage, showAvatar }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm');
  };

  const handleDelete = () => {
    // TODO: Implement delete
    console.log('Delete message:', message.id);
  };

  const handleEdit = () => {
    // TODO: Implement edit
    console.log('Edit message:', message.id);
  };

  return (
    <div className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}>
      {!isOwnMessage && showAvatar && (
        <div className="message-avatar">
          <div className="avatar-placeholder">U</div>
        </div>
      )}
      
      <div className="message-content-wrapper">
        <div className="message-bubble">
          {message.isDeleted ? (
            <p className="deleted-message">This message was deleted</p>
          ) : (
            <>
              <p className="message-text">{message.content}</p>
              {message.isEdited && <span className="edited-indicator">(edited)</span>}
            </>
          )}
          
          <div className="message-meta">
            <span className="message-time">{formatTime(message.createdAt)}</span>
            {isOwnMessage && (
              <span className={`message-status ${message.status}`}>
                {message.status === 'read' && '✓✓'}
                {message.status === 'delivered' && '✓'}
                {message.status === 'sent' && '✓'}
              </span>
            )}
          </div>
        </div>

        {isOwnMessage && !message.isDeleted && (
          <div className="message-actions">
            <button
              className="message-menu-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              ⋮
            </button>
            {showMenu && (
              <div className="message-menu">
                <button onClick={handleEdit}>Edit</button>
                <button onClick={handleDelete} className="danger">Delete</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
```

**Validation**:
- [ ] Messages display with correct styling
- [ ] Own vs other messages styled differently
- [ ] Time formatting works
- [ ] Message actions menu works

---

### Checkpoint 4.3: Create MessageInput Component
**Time**: 1 hour  
**Files**: `src/components/messages/MessageInput.tsx` (NEW)

**Tasks**:
1. Create message input with send functionality:
```tsx
import React, { useState, KeyboardEvent } from 'react';
import { useDispatch } from 'react-redux';
import { sendMessage } from '../../store/messagesSlice';
import { AppDispatch } from '../../store';
import './MessageInput.css';

interface MessageInputProps {
  conversationId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await dispatch(
        sendMessage({
          content: message.trim(),
          conversationId,
        })
      ).unwrap();
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input-container">
      <div className="message-input-wrapper">
        <button className="attachment-btn" title="Attach file">
          📎
        </button>
        
        <textarea
          className="message-input"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
          disabled={isSending}
        />
        
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          title="Send message"
        >
          {isSending ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
```

**Validation**:
- [ ] Input accepts text
- [ ] Send button works
- [ ] Enter key sends message
- [ ] Shift+Enter adds new line

---

## 🎯 Phase 5: Main Chat Page Layout (1-2 hours)

### Checkpoint 5.1: Create ChatPage Component
**Time**: 1 hour  
**Files**: `src/pages/ChatPage.tsx` (NEW)

**Tasks**:
1. Create main chat page layout:
```tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import ConversationsList from '../components/conversations/ConversationsList';
import MessagesList from '../components/messages/MessagesList';
import MessageInput from '../components/messages/MessageInput';
import NewConversationModal from '../components/conversations/NewConversationModal';
import './ChatPage.css';

const ChatPage: React.FC = () => {
  const [showNewConversation, setShowNewConversation] = useState(false);
  const { selectedConversation } = useSelector((state: RootState) => state.conversations);

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <ConversationsList />
        <button
          className="new-conversation-fab"
          onClick={() => setShowNewConversation(true)}
        >
          +
        </button>
      </div>

      <div className="chat-main">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <div className="conversation-info">
                <h2>{selectedConversation.name || 'Direct Message'}</h2>
                <p className="participants-count">
                  {selectedConversation.participants.length} participants
                </p>
              </div>
              <div className="chat-actions">
                <button className="icon-btn" title="Call">📞</button>
                <button className="icon-btn" title="Video call">📹</button>
                <button className="icon-btn" title="Info">ℹ️</button>
              </div>
            </div>

            <MessagesList conversationId={selectedConversation.id} />
            <MessageInput conversationId={selectedConversation.id} />
          </>
        ) : (
          <div className="no-conversation-selected">
            <h2>Welcome to Chat</h2>
            <p>Select a conversation or start a new one</p>
          </div>
        )}
      </div>

      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
      />
    </div>
  );
};

export default ChatPage;
```

**Validation**:
- [ ] Layout renders correctly
- [ ] Sidebar and main area display
- [ ] Conversation selection updates main area

---

### Checkpoint 5.2: Add Routing
**Time**: 30 minutes  
**Files**: `src/App.tsx`

**Tasks**:
1. Add chat route:
```tsx
import { Routes, Route } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/chat" />} />
    </Routes>
  );
}
```

**Validation**:
- [ ] Chat route accessible
- [ ] Protected by authentication
- [ ] Redirects work correctly

---

## 🎯 Phase 6: Styling & Polish (2-3 hours)

### Checkpoint 6.1: Create CSS Files
**Time**: 2 hours  
**Files**: Multiple CSS files

**Tasks**:
1. Create comprehensive styles for all components
2. Implement responsive design
3. Add animations and transitions
4. Ensure mobile compatibility

**Key CSS Files**:
- `ConversationsList.css`
- `ConversationItem.css`
- `MessagesList.css`
- `MessageItem.css`
- `MessageInput.css`
- `ChatPage.css`
- `NewConversationModal.css`

**Validation**:
- [ ] All components styled
- [ ] Responsive on mobile
- [ ] Smooth animations
- [ ] Consistent theme

---

### Checkpoint 6.2: Add Loading States
**Time**: 30 minutes  

**Tasks**:
1. Add skeleton loaders
2. Add loading spinners
3. Add empty states
4. Add error states

**Validation**:
- [ ] Loading states display
- [ ] Empty states helpful
- [ ] Error messages clear

---

### Checkpoint 6.3: Add Notifications
**Time**: 30 minutes  
**Files**: `src/components/common/Toast.tsx` (NEW)

**Tasks**:
1. Create toast notification system
2. Show success/error messages
3. Add sound notifications (optional)

**Validation**:
- [ ] Toasts display correctly
- [ ] Auto-dismiss works
- [ ] Multiple toasts stack

---

## 🎯 Phase 7: Real-time Features (Optional - 2-3 hours)

### Checkpoint 7.1: Add WebSocket Support
**Time**: 1.5 hours  
**Files**: `src/services/websocket.service.ts` (NEW)

**Tasks**:
1. Create WebSocket service
2. Connect to backend WebSocket
3. Handle incoming messages
4. Handle connection status

**Validation**:
- [ ] WebSocket connects
- [ ] Real-time messages work
- [ ] Reconnection works

---

### Checkpoint 7.2: Add Typing Indicators
**Time**: 1 hour  

**Tasks**:
1. Send typing events
2. Display typing indicators
3. Clear indicators after timeout

**Validation**:
- [ ] Typing shows in real-time
- [ ] Indicators clear properly

---

## 🎯 Phase 8: Testing & Deployment (1-2 hours)

### Checkpoint 8.1: Test All Features
**Time**: 1 hour  

**Tasks**:
1. Test conversation creation
2. Test message sending
3. Test pagination
4. Test search
5. Test on mobile

**Validation**:
- [ ] All features work
- [ ] No console errors
- [ ] Performance acceptable

---

### Checkpoint 8.2: Build & Deploy
**Time**: 30 minutes  

**Tasks**:
1. Build production bundle
2. Test production build locally
3. Deploy to CloudFront
4. Verify deployment

**Validation**:
- [ ] Build succeeds
- [ ] No warnings
- [ ] Deployed successfully

---

## 📊 Progress Tracking

### Phase 1: Services ⏳
- [ ] 1.1: Conversation Service
- [ ] 1.2: Messages Service
- [ ] 1.3: Users Service

### Phase 2: State Management ⏳
- [ ] 2.1: Conversations Store
- [ ] 2.2: Messages Store
- [ ] 2.3: Store Configuration

### Phase 3: Conversations UI ⏳
- [ ] 3.1: ConversationsList
- [ ] 3.2: ConversationItem
- [ ] 3.3: NewConversation Modal

### Phase 4: Messages UI ⏳
- [ ] 4.1: MessagesList
- [ ] 4.2: MessageItem
- [ ] 4.3: MessageInput

### Phase 5: Layout ⏳
- [ ] 5.1: ChatPage
- [ ] 5.2: Routing

### Phase 6: Styling ⏳
- [ ] 6.1: CSS Files
- [ ] 6.2: Loading States
- [ ] 6.3: Notifications

### Phase 7: Real-time (Optional) ⏳
- [ ] 7.1: WebSocket Support
- [ ] 7.2: Typing Indicators

### Phase 8: Testing ⏳
- [ ] 8.1: Feature Testing
- [ ] 8.2: Deployment

---

## 🚀 Quick Start Guide

### Day 1: Foundation (4-5 hours)
1. Complete Phase 1 (Services)
2. Complete Phase 2 (State Management)

### Day 2: Conversations (3-4 hours)
1. Complete Phase 3 (Conversations UI)

### Day 3: Messages (4-5 hours)
1. Complete Phase 4 (Messages UI)
2. Complete Phase 5 (Layout)

### Day 4: Polish (3-4 hours)
1. Complete Phase 6 (Styling)
2. Complete Phase 8 (Testing)

### Day 5: Real-time (Optional, 2-3 hours)
1. Complete Phase 7 (WebSocket)

**Total: ~20-25 hours over 4-5 days**

---

## 🎨 Design Guidelines

### Colors
- Primary: `#007bff`
- Secondary: `#6c757d`
- Success: `#28a745`
- Danger: `#dc3545`
- Background: `#f8f9fa`
- Text: `#212529`

### Typography
- Font Family: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Base Size: `16px`
- Headings: Bold, larger sizes

### Spacing
- Base unit: `8px`
- Use multiples: `8px, 16px, 24px, 32px`

### Borders
- Radius: `8px` for cards, `16px` for messages
- Color: `#dee2e6`

---

## 🐛 Common Issues & Solutions

### Issue: Messages not loading
**Solution**: Check Redux DevTools, verify API calls, check authentication token

### Issue: Real-time not working
**Solution**: Verify WebSocket connection, check CORS settings, check backend logs

### Issue: Styling broken on mobile
**Solution**: Use responsive units (`rem`, `%`), test with Chrome DevTools mobile view

### Issue: Performance slow with many messages
**Solution**: Implement virtual scrolling, optimize re-renders with `React.memo`

---

## ✅ Success Criteria

- [ ] Users can create conversations
- [ ] Users can send messages
- [ ] Messages display in real-time
- [ ] UI is responsive on mobile
- [ ] No console errors
- [ ] Performance is acceptable (< 3s load time)
- [ ] All features work in production

---

## 📝 Notes

- Use TypeScript for type safety
- Follow React best practices
- Keep components small and focused
- Use Redux for global state
- Use local state for UI-only state
- Test on multiple browsers
- Test on mobile devices
- Keep accessibility in mind (ARIA labels, keyboard navigation)
