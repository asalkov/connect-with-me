import { useState, useEffect } from 'react';
import { usersApi } from '../services/users.api';
import { User as ApiUser } from '../types/user';
import { useDebounce } from './useDebounce';

/**
 * Custom hook for searching users by email or username
 * Uses debounced search to avoid excessive API calls
 */
export const useUserSearch = (currentUserId?: string) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        setError(null);
        return;
      }

      try {
        setIsSearching(true);
        setError(null);

        // Call the real API to search users
        const response = await usersApi.searchUsers({ 
          query: debouncedQuery, 
          limit: 10 
        });

        // Filter out current user (backend should do this, but double-check)
        const filteredUsers = response.users.filter((user) => user.id !== currentUserId);
        
        setSearchResults(filteredUsers);
      } catch (error) {
        console.error('Error searching users:', error);
        setError('Failed to search users. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, currentUserId]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    error,
  };
};
