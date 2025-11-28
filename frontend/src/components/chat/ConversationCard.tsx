import { Card, CardContent, Box, Avatar, Typography, Badge } from '@mui/material';

interface ConversationCardProps {
  userName: string;
  userInitials: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  onClick: () => void;
}

export const ConversationCard = ({
  userName,
  userInitials,
  lastMessage,
  timestamp,
  unreadCount = 0,
  onClick,
}: ConversationCardProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        cursor: 'pointer',
        '&:hover': { boxShadow: 3 },
        transition: 'box-shadow 0.2s',
        bgcolor: unreadCount > 0 ? 'action.hover' : 'background.paper',
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
          <Badge
            badgeContent={unreadCount}
            color="primary"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                height: 20,
                minWidth: 20,
                borderRadius: '10px',
              },
            }}
          >
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
          </Badge>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '1rem', 
                  fontWeight: unreadCount > 0 ? 700 : 600,
                }}
              >
                {userName}
              </Typography>
              <Typography 
                variant="caption" 
                color={unreadCount > 0 ? 'primary.main' : 'text.secondary'}
                sx={{ fontWeight: unreadCount > 0 ? 600 : 400 }}
              >
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
                fontWeight: unreadCount > 0 ? 600 : 400,
              }}
            >
              {lastMessage}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
