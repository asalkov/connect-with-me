import { useEffect } from 'react';
import { Box, Typography, Paper, Avatar, Chip } from '@mui/material';
import { MainLayout } from '../components/layout';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getProfile } from '../store/slices/authSlice';

export const ChatPage = () => {
  //const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // useEffect(() => {
    //   // Fetch user profile on mount
    //   dispatch(getProfile());
    // }, [dispatch]);

  return (
    <MainLayout>
      <Box>
        <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Chats
          </Typography>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                {user.firstName?.[0] || user.username[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Chip label="Online" color="success" size="small" sx={{ ml: 'auto' }} />
            </Box>
          )}

          <Typography variant="body1" color="text.secondary" paragraph>
            Welcome to your chat dashboard! The messaging interface will be implemented in the next sprint.
          </Typography>

          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Coming Soon:
            </Typography>
            <Typography component="div" variant="body2" color="text.secondary">
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li>Real-time messaging with WebSocket</li>
                <li>Direct and group conversations</li>
                <li>File sharing and media preview</li>
                <li>User presence indicators</li>
                <li>Typing indicators</li>
                <li>Message reactions and emojis</li>
                <li>Message search and history</li>
                <li>Push notifications</li>
              </ul>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
};
