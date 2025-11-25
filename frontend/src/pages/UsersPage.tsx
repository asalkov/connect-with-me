import { Box, Typography, Paper } from '@mui/material';
import { MainLayout } from '../components/layout';
import { UserSearch } from '../components/users';
import { User } from '../types/user';

export const UsersPage = () => {
  const handleUserSelect = (user: User) => {
    console.log('Selected user:', user);
    // In a real app, this would navigate to the user's profile or start a conversation
  };

  return (
    <MainLayout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Find Users
        </Typography>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Search for users to start a conversation or view their profile.
          </Typography>
          <UserSearch onUserSelect={handleUserSelect} />
        </Paper>
      </Box>
    </MainLayout>
  );
};
