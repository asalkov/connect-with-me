import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  register,
  login,
  logout,
  clearError,
  setCredentials,
  clearCredentials,
} from './authSlice';
import { apiService } from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

describe('authSlice', () => {
  let store: ReturnType<typeof createTestStore>;

  const createTestStore = () =>
    configureStore({
      reducer: {
        auth: authReducer,
      },
    });

  beforeEach(() => {
    store = createTestStore();
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('reducers', () => {
    it('should clear error', () => {
      store.dispatch({ type: 'auth/register/rejected', payload: 'Test error' });
      expect(store.getState().auth.error).toBe('Test error');

      store.dispatch(clearError());
      expect(store.getState().auth.error).toBeNull();
    });

    it('should set credentials', () => {
      const credentials = {
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      store.dispatch(setCredentials(credentials));

      const state = store.getState().auth;
      expect(state.user).toEqual(credentials.user);
      expect(state.accessToken).toBe('access-token');
      expect(state.refreshToken).toBe('refresh-token');
      expect(state.isAuthenticated).toBe(true);
      expect(localStorage.getItem('accessToken')).toBe('access-token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    });

    it('should clear credentials', () => {
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('refreshToken', 'refresh');

      store.dispatch(clearCredentials());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('register async thunk', () => {
    it('should handle successful registration', async () => {
      const mockResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      vi.mocked(apiService.register).mockResolvedValue(mockResponse);

      await store.dispatch(
        register({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Password123!',
        }),
      );

      const state = store.getState().auth;
      expect(state.user).toEqual(mockResponse.user);
      expect(state.accessToken).toBe('access-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle registration failure', async () => {
      vi.mocked(apiService.register).mockRejectedValue({
        statusCode: 409,
        message: 'Email already exists',
      });

      await store.dispatch(
        register({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Password123!',
        }),
      );

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Email already exists');
    });
  });

  describe('login async thunk', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      vi.mocked(apiService.login).mockResolvedValue(mockResponse);

      await store.dispatch(
        login({
          emailOrUsername: 'test@example.com',
          password: 'Password123!',
        }),
      );

      const state = store.getState().auth;
      expect(state.user).toEqual(mockResponse.user);
      expect(state.accessToken).toBe('access-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle login failure', async () => {
      vi.mocked(apiService.login).mockRejectedValue({
        statusCode: 401,
        message: 'Invalid credentials',
      });

      await store.dispatch(
        login({
          emailOrUsername: 'test@example.com',
          password: 'WrongPassword',
        }),
      );

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });
  });

  describe('logout async thunk', () => {
    it('should handle successful logout', async () => {
      // Set up authenticated state
      store.dispatch(
        setCredentials({
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
          },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        }),
      );

      vi.mocked(apiService.logout).mockResolvedValue();

      await store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('should clear credentials even if logout API fails', async () => {
      store.dispatch(
        setCredentials({
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
          },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        }),
      );

      vi.mocked(apiService.logout).mockRejectedValue(new Error('Network error'));

      await store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
