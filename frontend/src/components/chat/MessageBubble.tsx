import { Box, Typography, CircularProgress } from '@mui/material';
import { 
  Done as DoneIcon, 
  DoneAll as DoneAllIcon,
  Schedule as ScheduleIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  status?: MessageStatus;
  onRetry?: () => void;
}

export const MessageBubble = ({ 
  content, 
  timestamp, 
  isOwn, 
  status = 'sent',
  onRetry 
}: MessageBubbleProps) => {
  
  // Render status icon based on message status
  const renderStatusIcon = () => {
    if (!isOwn) return null;

    switch (status) {
      case 'sending':
        return (
          <CircularProgress 
            size={12} 
            sx={{ color: 'text.secondary' }} 
          />
        );
      case 'sent':
        return (
          <DoneIcon 
            sx={{ fontSize: '0.875rem', color: 'text.secondary' }} 
          />
        );
      case 'delivered':
        return (
          <DoneAllIcon 
            sx={{ fontSize: '0.875rem', color: 'text.secondary' }} 
          />
        );
      case 'read':
        return (
          <DoneAllIcon 
            sx={{ fontSize: '0.875rem', color: 'primary.main' }} 
          />
        );
      case 'failed':
        return (
          <ErrorIcon 
            sx={{ 
              fontSize: '0.875rem', 
              color: 'error.main',
              cursor: onRetry ? 'pointer' : 'default'
            }}
            onClick={onRetry}
            titleAccess="Failed to send. Click to retry."
          />
        );
      default:
        return null;
    }
  };

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
          bgcolor: isOwn 
            ? 'primary.main' 
            : (theme) => theme.palette.mode === 'dark' 
              ? 'grey.800' 
              : 'grey.100',
          color: isOwn ? 'white' : 'text.primary',
          borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          boxShadow: 1,
          opacity: status === 'sending' ? 0.7 : 1,
          transition: 'opacity 0.2s ease',
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
        <Typography 
          variant="caption" 
          color={status === 'failed' ? 'error.main' : 'text.secondary'} 
          fontSize="0.7rem"
        >
          {status === 'failed' ? 'Failed to send' : timestamp}
        </Typography>
        {renderStatusIcon()}
      </Box>
    </Box>
  );
};
