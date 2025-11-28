import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  List,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { User as ApiUser } from '../../types/user';
import { UserSearchItem } from './UserSearchItem';

interface StartChatModalProps {
  open: boolean;
  searchQuery: string;
  searchResults: ApiUser[];
  isSearching: boolean;
  error?: string | null;
  onClose: () => void;
  onSearchChange: (query: string) => void;
  onUserSelect: (user: ApiUser) => void;
}

export const StartChatModal = ({
  open,
  searchQuery,
  searchResults,
  isSearching,
  error,
  onClose,
  onSearchChange,
  onUserSelect,
}: StartChatModalProps) => {
  const renderSearchResults = () => {
    if (searchQuery.trim() === '') {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Enter a username or email to search for users
          </Typography>
        </Box>
      );
    }

    if (isSearching) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Searching...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }

    if (searchResults.length === 0) {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No users found matching "{searchQuery}"
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Try searching with a different username or email
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1, display: 'block' }}>
          {searchResults.length} {searchResults.length === 1 ? 'user' : 'users'} found
        </Typography>
        <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
          {searchResults.map((user) => (
            <UserSearchItem key={user.id} user={user} onClick={onUserSelect} />
          ))}
        </List>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Start New Chat</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Search by username or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          variant="outlined"
          sx={{ mt: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ mt: 3 }}>{renderSearchResults()}</Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
