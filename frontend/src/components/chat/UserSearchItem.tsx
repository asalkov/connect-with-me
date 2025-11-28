import { ListItem, Avatar, Box, Typography } from '@mui/material';
import { User as ApiUser } from '../../types/user';
import { getUserDisplayName, getUserInitials } from '../../utils/userHelpers';

interface UserSearchItemProps {
  user: ApiUser;
  onClick: (user: ApiUser) => void;
}

export const UserSearchItem = ({ user, onClick }: UserSearchItemProps) => {
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  return (
    <ListItem
      sx={{
        cursor: 'pointer',
        borderRadius: 1,
        mb: 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
      onClick={() => onClick(user)}
    >
      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
        {initials}
      </Avatar>
      <Box>
        <Typography variant="body1" fontWeight={500}>
          {displayName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          @{user.username} • {user.email}
        </Typography>
      </Box>
    </ListItem>
  );
};
