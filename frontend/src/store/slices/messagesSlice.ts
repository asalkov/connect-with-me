import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { messagesService, Message, CreateMessageDto, UpdateMessageDto } from '../../services/messages.api';

interface MessagesState {
  messagesByConversation: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
  cursors: Record<string, string | undefined>;
  hasMore: Record<string, boolean>;
}

const initialState: MessagesState = {
  messagesByConversation: {},
  loading: false,
  error: null,
  cursors: {},
  hasMore: {},
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetch',
  async ({ conversationId, limit, cursor }: { conversationId: string; limit?: number; cursor?: string }) => {
    const response = await messagesService.getMessages(conversationId, limit, cursor);
    return { conversationId, ...response };
  }
);

export const sendMessage = createAsyncThunk(
  'messages/send',
  async (data: CreateMessageDto) => {
    return await messagesService.sendMessage(data);
  }
);

export const updateMessage = createAsyncThunk(
  'messages/update',
  async ({ id, data }: { id: string; data: UpdateMessageDto }) => {
    return await messagesService.updateMessage(id, data);
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/delete',
  async (id: string) => {
    await messagesService.deleteMessage(id);
    return id;
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageId: string) => {
    await messagesService.markAsRead(messageId);
    return messageId;
  }
);

export const markConversationAsRead = createAsyncThunk(
  'messages/markConversationAsRead',
  async (conversationId: string) => {
    await messagesService.markConversationAsRead(conversationId);
    return conversationId;
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
      
      // Check if message already exists
      const exists = state.messagesByConversation[conversationId].some(
        msg => msg.id === action.payload.id
      );
      
      if (!exists) {
        state.messagesByConversation[conversationId].push(action.payload);
      }
    },
    
    clearMessages: (state, action: PayloadAction<string>) => {
      delete state.messagesByConversation[action.payload];
      delete state.cursors[action.payload];
      delete state.hasMore[action.payload];
    },
    
    clearAllMessages: (state) => {
      state.messagesByConversation = {};
      state.cursors = {};
      state.hasMore = {};
    },
    
    updateMessageOptimistic: (state, action: PayloadAction<{ id: string; conversationId: string; content: string }>) => {
      const { id, conversationId, content } = action.payload;
      const messages = state.messagesByConversation[conversationId];
      if (messages) {
        const message = messages.find(msg => msg.id === id);
        if (message) {
          message.content = content;
          message.isEdited = true;
        }
      }
    },
    
    deleteMessageOptimistic: (state, action: PayloadAction<{ id: string; conversationId: string }>) => {
      const { id, conversationId } = action.payload;
      const messages = state.messagesByConversation[conversationId];
      if (messages) {
        const message = messages.find(msg => msg.id === id);
        if (message) {
          message.isDeleted = true;
          message.content = '';
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, messages, nextCursor } = action.payload;
        
        if (!state.messagesByConversation[conversationId]) {
          state.messagesByConversation[conversationId] = [];
        }
        
        // If cursor was provided, we're loading older messages (prepend)
        // Otherwise, we're loading initial messages (replace)
        if (action.meta.arg.cursor) {
          // Prepend older messages
          const existingIds = new Set(state.messagesByConversation[conversationId].map(m => m.id));
          const newMessages = messages.filter(m => !existingIds.has(m.id));
          state.messagesByConversation[conversationId] = [
            ...newMessages.reverse(),
            ...state.messagesByConversation[conversationId],
          ];
        } else {
          // Initial load - replace all messages
          state.messagesByConversation[conversationId] = messages.reverse();
        }
        
        state.cursors[conversationId] = nextCursor;
        state.hasMore[conversationId] = !!nextCursor;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const conversationId = action.payload.conversationId;
        if (!state.messagesByConversation[conversationId]) {
          state.messagesByConversation[conversationId] = [];
        }
        
        // Check if message already exists (avoid duplicates)
        const exists = state.messagesByConversation[conversationId].some(
          msg => msg.id === action.payload.id
        );
        
        if (!exists) {
          state.messagesByConversation[conversationId].push(action.payload);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to send message';
      })
      
      // Update message
      .addCase(updateMessage.fulfilled, (state, action) => {
        const conversationId = action.payload.conversationId;
        const messages = state.messagesByConversation[conversationId];
        if (messages) {
          const index = messages.findIndex(msg => msg.id === action.payload.id);
          if (index !== -1) {
            messages[index] = action.payload;
          }
        }
      })
      
      // Delete message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        Object.keys(state.messagesByConversation).forEach((conversationId) => {
          const messages = state.messagesByConversation[conversationId];
          const message = messages.find(msg => msg.id === messageId);
          if (message) {
            message.isDeleted = true;
            message.content = '';
          }
        });
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const messageId = action.payload;
        Object.keys(state.messagesByConversation).forEach((conversationId) => {
          const messages = state.messagesByConversation[conversationId];
          const message = messages.find(msg => msg.id === messageId);
          if (message) {
            message.status = 'read';
          }
        });
      })
      
      // Mark conversation as read
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const conversationId = action.payload;
        const messages = state.messagesByConversation[conversationId];
        if (messages) {
          messages.forEach(msg => {
            if (msg.status !== 'read') {
              msg.status = 'read';
            }
          });
        }
      });
  },
});

export const {
  addMessage,
  clearMessages,
  clearAllMessages,
  updateMessageOptimistic,
  deleteMessageOptimistic,
} = messagesSlice.actions;

export default messagesSlice.reducer;
