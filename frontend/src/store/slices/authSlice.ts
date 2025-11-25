import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService, RegisterData, LoginData, AuthResponse, ApiError } from '../../services/api';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
};

// Async thunks
export const register = createAsyncThunk<
  AuthResponse,
  RegisterData,
  { rejectValue: string }
>('auth/register', async (data, { rejectWithValue }) => {
  try {
    const response = await apiService.register(data);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    const message = Array.isArray(apiError.message)
      ? apiError.message.join(', ')
      : apiError.message;
    return rejectWithValue(message);
  }
});

export const login = createAsyncThunk<
  AuthResponse,
  LoginData,
  { rejectValue: string }
>('auth/login', async (data, { rejectWithValue }) => {
  try {
    const response = await apiService.login(data);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    const message = Array.isArray(apiError.message)
      ? apiError.message.join(', ')
      : apiError.message;
    return rejectWithValue(message);
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.logout();
    } catch (error) {
      const apiError = error as ApiError;
      const message = Array.isArray(apiError.message)
        ? apiError.message.join(', ')
        : apiError.message;
      return rejectWithValue(message);
    }
  },
);

export const getProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const user = await apiService.getProfile();
    return user;
  } catch (error) {
    const apiError = error as ApiError;
    const message = Array.isArray(apiError.message)
      ? apiError.message.join(', ')
      : apiError.message;
    return rejectWithValue(message);
  }
});

export const refreshAccessToken = createAsyncThunk<
  AuthResponse,
  string,
  { rejectValue: string }
>('auth/refreshToken', async (refreshToken, { rejectWithValue }) => {
  try {
    const response = await apiService.refreshToken(refreshToken);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    const message = Array.isArray(apiError.message)
      ? apiError.message.join(', ')
      : apiError.message;
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        // Clear credentials even if logout fails
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });

    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch profile';
        // Clear credentials if profile fetch fails (token likely invalid)
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });

    // Refresh Token
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });
  },
});

export const { clearError, setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
