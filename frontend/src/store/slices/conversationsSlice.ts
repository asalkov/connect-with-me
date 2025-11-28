import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { conversationsService, Conversation, CreateConversationDto } from '../../services/conversations.api';

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

// Async thunks
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
  async (data: CreateConversationDto) => {
    return await conversationsService.createConversation(data);
  }
);

export const updateConversation = createAsyncThunk(
  'conversations/update',
  async ({ id, data }: { id: string; data: { name?: string; description?: string; avatarUrl?: string } }) => {
    return await conversationsService.updateConversation(id, data);
  }
);

export const deleteConversation = createAsyncThunk(
  'conversations/delete',
  async (id: string) => {
    await conversationsService.deleteConversation(id);
    return id;
  }
);

export const addParticipant = createAsyncThunk(
  'conversations/addParticipant',
  async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
    await conversationsService.addParticipant(conversationId, userId);
    return { conversationId, userId };
  }
);

export const removeParticipant = createAsyncThunk(
  'conversations/removeParticipant',
  async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
    await conversationsService.removeParticipant(conversationId, userId);
    return { conversationId, userId };
  }
);

export const leaveConversation = createAsyncThunk(
  'conversations/leave',
  async (conversationId: string) => {
    await conversationsService.leaveConversation(conversationId);
    return conversationId;
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
    clearSelectedConversation: (state) => {
      state.selectedConversation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all conversations
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
      
      // Fetch single conversation
      .addCase(fetchConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedConversation = action.payload;
        
        // Update in list if exists
        const index = state.conversations.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.conversations[index] = action.payload;
        }
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch conversation';
      })
      
      // Create conversation
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations.unshift(action.payload);
        state.selectedConversation = action.payload;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create conversation';
      })
      
      // Update conversation
      .addCase(updateConversation.fulfilled, (state, action) => {
        const index = state.conversations.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.conversations[index] = action.payload;
        }
        if (state.selectedConversation?.id === action.payload.id) {
          state.selectedConversation = action.payload;
        }
      })
      
      // Delete conversation
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c.id !== action.payload);
        if (state.selectedConversation?.id === action.payload) {
          state.selectedConversation = null;
        }
      })
      
      // Leave conversation
      .addCase(leaveConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c.id !== action.payload);
        if (state.selectedConversation?.id === action.payload) {
          state.selectedConversation = null;
        }
      });
  },
});

export const { selectConversation, clearError, clearSelectedConversation } = conversationsSlice.actions;
export default conversationsSlice.reducer;
