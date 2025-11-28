import { Box, Typography, IconButton, InputBase, Avatar, CircularProgress, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Send as SendIcon, MoreVert as MoreVertIcon, EmojiEmotions as EmojiIcon, AttachFile as AttachFileIcon, Mic as MicIcon } from '@mui/icons-material';
import { MessageBubble } from './MessageBubble';
import { MessageDisplay } from '../../hooks/useMessages';
import { ConversationDisplay } from '../../hooks/useConversations';
import { useMediaQuery, useTheme } from '@mui/material';

interface MessageViewProps {
  conversation: ConversationDisplay;
  messages: MessageDisplay[];
  messageText: string;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  onBack: () => void;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
}

export const MessageView = ({
  conversation,
  messages,
  messageText,
  isLoadingMessages,
  isSendingMessage,
  onBack,
  onMessageChange,
  onSendMessage,
}: MessageViewProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {isMobile && (
          <IconButton onClick={onBack} sx={{ mr: 1 }} edge="start">
            <ArrowBackIcon />
          </IconButton>
        )}
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, mr: 2 }}>
          {conversation.userInitials}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {conversation.userName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            🟢 Online • Last seen just now
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {isLoadingMessages ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 2 }}>
            <Typography variant="h6" color="text.secondary">
              No messages yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start the conversation!
            </Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              timestamp={message.timestamp}
              isOwn={message.isOwn}
            />
          ))
        )}
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 1,
            bgcolor: 'action.hover',
            borderRadius: 3,
            px: 2,
            py: 1,
          }}
        >
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <EmojiIcon fontSize="small" />
          </IconButton>
          
          <InputBase
            fullWidth
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
            sx={{
              flex: 1,
              fontSize: '0.875rem',
              py: 0.5,
            }}
          />

          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <AttachFileIcon fontSize="small" />
          </IconButton>

          {messageText.trim() ? (
            <IconButton
              color="primary"
              onClick={onSendMessage}
              disabled={isSendingMessage}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          ) : (
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <MicIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};
