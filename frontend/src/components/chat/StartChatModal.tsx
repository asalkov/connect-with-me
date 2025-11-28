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
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Enter a username or email to search for users
        </Typography>
      );
    }

    if (isSearching) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Searching...
        </Typography>
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
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No users found matching "{searchQuery}"
        </Typography>
      );
    }

    return (
      <List>
        {searchResults.map((user) => (
          <UserSearchItem key={user.id} user={user} onClick={onUserSelect} />
        ))}
      </List>
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
