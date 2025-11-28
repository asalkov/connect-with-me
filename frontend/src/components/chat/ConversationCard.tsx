import { Card, CardContent, Box, Avatar, Typography, Chip } from '@mui/material';

interface ConversationCardProps {
  userName: string;
  userInitials: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
  onClick: () => void;
}

export const ConversationCard = ({
  userName,
  userInitials,
  lastMessage,
  timestamp,
  unread,
  onClick,
}: ConversationCardProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        cursor: 'pointer',
        '&:hover': { boxShadow: 3 },
        transition: 'box-shadow 0.2s',
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            {userInitials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {timestamp}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {lastMessage}
            </Typography>
            {unread && (
              <Chip
                label="New"
                size="small"
                color="primary"
                sx={{ mt: 1, height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
