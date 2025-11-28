import { Box, Typography } from '@mui/material';
import { Done as DoneIcon, DoneAll as DoneAllIcon } from '@mui/icons-material';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  isRead?: boolean;
}

export const MessageBubble = ({ content, timestamp, isOwn, isRead = false }: MessageBubbleProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',
          px: 2,
          py: 1.5,
          bgcolor: isOwn ? 'primary.main' : 'grey.100',
          color: isOwn ? 'white' : 'text.primary',
          borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          boxShadow: 1,
        }}
      >
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          {content}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mt: 0.5,
          px: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
          {timestamp}
        </Typography>
        {isOwn && (
          isRead ? (
            <DoneAllIcon sx={{ fontSize: '0.875rem', color: 'primary.main' }} />
          ) : (
            <DoneIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
          )
        )}
      </Box>
    </Box>
  );
};
