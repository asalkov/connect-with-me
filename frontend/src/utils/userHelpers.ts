import { User as ApiUser } from '../types/user';

// Minimal user interface for display helpers
interface UserLike {
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

/**
 * Get user's display name (full name or username)
 */
export const getUserDisplayName = (user: UserLike): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username;
};

/**
 * Get user's initials for avatar
 */
export const getUserInitials = (user: UserLike): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  return user.username[0].toUpperCase();
};

/**
 * Format user for display in search results
 */
export const formatUserForDisplay = (user: ApiUser) => ({
  displayName: getUserDisplayName(user),
  initials: getUserInitials(user),
  subtitle: `@${user.username} • ${user.email}`,
});
