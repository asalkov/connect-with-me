import { Box, Typography, Paper, IconButton, TextField, Divider, List, Avatar } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Send as SendIcon } from '@mui/icons-material';
import { MessageBubble } from './MessageBubble';
import { MessageDisplay } from '../../hooks/useMessages';
import { ConversationDisplay } from '../../hooks/useConversations';

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
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
          {conversation.userInitials}
        </Avatar>
        <Typography variant="h5" component="h1">
          {conversation.userName}
        </Typography>
      </Box>

      {/* Messages Container */}
      <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)' }}>
        {/* Messages List */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {isLoadingMessages ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="text.secondary">Loading messages...</Typography>
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
            </Box>
          ) : (
            <List>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  timestamp={message.timestamp}
                  isOwn={message.isOwn}
                />
              ))}
            </List>
          )}
        </Box>

        <Divider />

        {/* Message Input */}
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            multiline
            maxRows={4}
          />
          <IconButton
            color="primary"
            onClick={onSendMessage}
            disabled={isSendingMessage || !messageText.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};
