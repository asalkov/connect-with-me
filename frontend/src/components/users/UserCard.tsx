import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { User, UserStatus } from '../../types/user';

interface UserCardProps {
  user: User;
  onClick?: () => void;
}

export const UserCard = ({ user, onClick }: UserCardProps) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const getUserInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  const getAvatarUrl = () => {
    if (user.avatarUrl) {
      return `${API_URL}${user.avatarUrl}`;
    }
    return null;
  };

  const getStatusColor = () => {
    switch (user.status) {
      case UserStatus.ONLINE:
        return 'success';
      case UserStatus.AWAY:
        return 'warning';
      case UserStatus.OFFLINE:
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              boxShadow: 3,
              transform: 'translateY(-2px)',
              transition: 'all 0.2s',
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={getAvatarUrl() || undefined}
            sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
          >
            {!getAvatarUrl() && getUserInitials()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{user.username}
            </Typography>
            {user.bio && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {user.bio}
              </Typography>
            )}
          </Box>
          <Chip label={user.status} color={getStatusColor()} size="small" />
        </Box>
      </CardContent>
    </Card>
  );
};
