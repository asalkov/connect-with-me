import { configureStore } from '@reduxjs/toolkit';
import usersReducer, {
  fetchMyProfile,
  updateMyProfile,
  searchUsers,
  uploadAvatar,
  deleteAvatar,
  clearError,
  clearSearchResults,
  setSelectedUser,
} from './usersSlice';
import { User, UserStatus } from '../../types/user';

// Mock the users API
jest.mock('../../services/users.api', () => ({
  usersApi: {
    getMyProfile: jest.fn(),
    updateMyProfile: jest.fn(),
    searchUsers: jest.fn(),
    uploadAvatar: jest.fn(),
    deleteAvatar: jest.fn(),
  },
}));

import { usersApi } from '../../services/users.api';

describe('usersSlice', () => {
  let store: ReturnType<typeof configureStore<{ users: ReturnType<typeof usersReducer> }>>;

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    avatarUrl: '/uploads/avatar.jpg',
    bio: 'Test bio',
    status: UserStatus.ONLINE,
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        users: usersReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().users;
      expect(state.currentUser).toBeNull();
      expect(state.searchResults).toEqual([]);
      expect(state.searchTotal).toBe(0);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('reducers', () => {
    it('should clear error', () => {
      store.dispatch(clearError());
      const state = store.getState().users;
      expect(state.error).toBeNull();
    });

    it('should clear search results', () => {
      store.dispatch(clearSearchResults());
      const state = store.getState().users;
      expect(state.searchResults).toEqual([]);
      expect(state.searchTotal).toBe(0);
      expect(state.searchPage).toBe(1);
    });

    it('should set selected user', () => {
      store.dispatch(setSelectedUser(mockUser));
      const state = store.getState().users;
      expect(state.selectedUser).toEqual(mockUser);
    });
  });

  describe('fetchMyProfile', () => {
    it('should fetch user profile successfully', async () => {
      (usersApi.getMyProfile as jest.Mock).mockResolvedValue(mockUser);

      await store.dispatch(fetchMyProfile());
      const state = store.getState().users;

      expect(state.currentUser).toEqual(mockUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch profile error', async () => {
      const errorMessage = 'Failed to fetch profile';
      (usersApi.getMyProfile as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchMyProfile());
      const state = store.getState().users;

      expect(state.currentUser).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('updateMyProfile', () => {
    it('should update profile successfully', async () => {
      const updatedUser = { ...mockUser, firstName: 'Updated' };
      (usersApi.updateMyProfile as jest.Mock).mockResolvedValue(updatedUser);

      await store.dispatch(updateMyProfile({ firstName: 'Updated' }));
      const state = store.getState().users;

      expect(state.currentUser).toEqual(updatedUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle update profile error', async () => {
      const errorMessage = 'Failed to update profile';
      (usersApi.updateMyProfile as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await store.dispatch(updateMyProfile({ firstName: 'Updated' }));
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      const searchResponse = {
        users: [mockUser],
        total: 1,
        page: 1,
        limit: 20,
      };
      (usersApi.searchUsers as jest.Mock).mockResolvedValue(searchResponse);

      await store.dispatch(searchUsers({ query: 'test' }));
      const state = store.getState().users;

      expect(state.searchResults).toEqual([mockUser]);
      expect(state.searchTotal).toBe(1);
      expect(state.searchPage).toBe(1);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle search users error', async () => {
      const errorMessage = 'Failed to search users';
      (usersApi.searchUsers as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await store.dispatch(searchUsers({ query: 'test' }));
      const state = store.getState().users;

      expect(state.searchResults).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      const updatedUser = { ...mockUser, avatarUrl: '/uploads/new-avatar.jpg' };
      (usersApi.uploadAvatar as jest.Mock).mockResolvedValue(updatedUser);

      const file = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
      await store.dispatch(uploadAvatar(file));
      const state = store.getState().users;

      expect(state.currentUser).toEqual(updatedUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle upload avatar error', async () => {
      const errorMessage = 'Failed to upload avatar';
      (usersApi.uploadAvatar as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const file = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
      await store.dispatch(uploadAvatar(file));
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar successfully', async () => {
      const updatedUser = { ...mockUser, avatarUrl: null };
      (usersApi.deleteAvatar as jest.Mock).mockResolvedValue(updatedUser);

      await store.dispatch(deleteAvatar());
      const state = store.getState().users;

      expect(state.currentUser?.avatarUrl).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle delete avatar error', async () => {
      const errorMessage = 'Failed to delete avatar';
      (usersApi.deleteAvatar as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await store.dispatch(deleteAvatar());
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });
});
