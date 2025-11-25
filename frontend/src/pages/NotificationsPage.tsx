import { Box, Typography, Paper, List, ListItem, ListItemAvatar, ListItemText, Avatar, Chip, IconButton } from '@mui/material';
import { 
  Notifications as NotificationsIcon, 
  Message as MessageIcon, 
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { MainLayout } from '../components/layout';

export const NotificationsPage = () => {
  const mockNotifications = [
    {
      id: 1,
      type: 'message',
      title: 'New message from John Doe',
      description: 'Hey, how are you doing?',
      time: '5 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'group',
      title: 'Added to "Project Team"',
      description: 'You were added to a new group',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      type: 'friend',
      title: 'Friend request',
      description: 'Jane Smith sent you a friend request',
      time: '2 hours ago',
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageIcon />;
      case 'group':
        return <GroupIcon />;
      case 'friend':
        return <PersonAddIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <MainLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Notifications
          </Typography>
          <Chip label="3 Unread" color="primary" size="small" />
        </Box>

        <Paper elevation={2}>
          <List sx={{ p: 0 }}>
            {mockNotifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" disabled>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={notification.read ? 400 : 600}>
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip label="New" color="primary" size="small" sx={{ height: 20 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.time}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < mockNotifications.length - 1 && <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}
              </Box>
            ))}
          </List>

          <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary">
              Real-time notifications will be implemented in Sprint 3.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
};
