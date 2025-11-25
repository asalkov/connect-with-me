import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usersApi } from '../../services/users.api';
import { User, UpdateProfileData, SearchUsersParams } from '../../types/user';

interface UsersState {
  currentUser: User | null;
  searchResults: User[];
  searchTotal: number;
  searchPage: number;
  searchLimit: number;
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  currentUser: null,
  searchResults: [],
  searchTotal: 0,
  searchPage: 1,
  searchLimit: 20,
  selectedUser: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchMyProfile = createAsyncThunk(
  'users/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.getMyProfile();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

export const updateMyProfile = createAsyncThunk(
  'users/updateMyProfile',
  async (data: UpdateProfileData, { rejectWithValue }) => {
    try {
      return await usersApi.updateMyProfile(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'users/fetchUserProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await usersApi.getUserProfile(userId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (params: SearchUsersParams, { rejectWithValue }) => {
    try {
      return await usersApi.searchUsers(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search users');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'users/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      return await usersApi.uploadAvatar(file);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload avatar');
    }
  }
);

export const deleteAvatar = createAsyncThunk(
  'users/deleteAvatar',
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.deleteAvatar();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete avatar');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchTotal = 0;
      state.searchPage = 1;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch my profile
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update my profile
      .addCase(updateMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.users;
        state.searchTotal = action.payload.total;
        state.searchPage = action.payload.page;
        state.searchLimit = action.payload.limit;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Upload avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete avatar
      .addCase(deleteAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(deleteAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSearchResults, setSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;
