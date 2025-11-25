import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  InputAdornment,
  Paper,
  Pagination,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { searchUsers, clearSearchResults } from '../../store/slices/usersSlice';
import { User } from '../../types/user';

interface UserSearchProps {
  onUserSelect?: (user: User) => void;
}

export const UserSearch = ({ onUserSelect }: UserSearchProps) => {
  const dispatch = useAppDispatch();
  const { searchResults, searchTotal, searchPage, searchLimit, loading } = useAppSelector(
    (state) => state.users
  );
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      dispatch(searchUsers({ query: debouncedQuery, page: 1, limit: searchLimit }));
    } else {
      dispatch(clearSearchResults());
    }
  }, [debouncedQuery, dispatch, searchLimit]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(searchUsers({ query: debouncedQuery, page, limit: searchLimit }));
  };

  const handleUserClick = (user: User) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  const getAvatarUrl = (user: User) => {
    if (user.avatarUrl) {
      return `${API_URL}${user.avatarUrl}`;
    }
    return null;
  };

  const totalPages = Math.ceil(searchTotal / searchLimit);

  return (
    <Box>
      <TextField
        fullWidth
        placeholder="Search users by username, email, or name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: loading && (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {searchResults.length > 0 ? (
        <Paper elevation={1}>
          <List>
            {searchResults.map((user) => (
              <ListItem
                key={user.id}
                button
                onClick={() => handleUserClick(user)}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar src={getAvatarUrl(user) || undefined} sx={{ bgcolor: 'primary.main' }}>
                    {!getAvatarUrl(user) && getUserInitials(user)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.username
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.secondary">
                        @{user.username}
                      </Typography>
                      {user.bio && (
                        <>
                          {' • '}
                          <Typography component="span" variant="body2" color="text.secondary">
                            {user.bio.length > 50 ? `${user.bio.substring(0, 50)}...` : user.bio}
                          </Typography>
                        </>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPages}
                page={searchPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      ) : debouncedQuery && !loading ? (
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No users found</Typography>
        </Paper>
      ) : null}
    </Box>
  );
};
