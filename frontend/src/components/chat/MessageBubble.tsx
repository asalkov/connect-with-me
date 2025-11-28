import { ListItem, Paper, Typography } from '@mui/material';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export const MessageBubble = ({ content, timestamp, isOwn }: MessageBubbleProps) => {
  return (
    <ListItem
      sx={{
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '70%',
          bgcolor: isOwn ? 'primary.main' : 'grey.200',
          color: isOwn ? 'white' : 'text.primary',
          borderRadius: 2,
        }}
      >
        <Typography variant="body1">{content}</Typography>
      </Paper>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
        {timestamp}
      </Typography>
    </ListItem>
  );
};
