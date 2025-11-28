import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ConversationCard } from './ConversationCard';
import { EmptyState } from './EmptyState';
import { ConversationDisplay } from '../../hooks/useConversations';

interface ConversationListViewProps {
  conversations: ConversationDisplay[];
  isLoading: boolean;
  onConversationClick: (conversation: ConversationDisplay) => void;
  onStartChat: () => void;
}

export const ConversationListView = ({
  conversations,
  isLoading,
  onConversationClick,
  onStartChat,
}: ConversationListViewProps) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Conversations
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onStartChat}>
          Start Chat
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        {isLoading ? (
          <EmptyState title="Loading conversations..." />
        ) : conversations.length === 0 ? (
          <EmptyState
            title="No conversations yet"
            subtitle='Click "Start Chat" to begin a conversation'
          />
        ) : (
          <Grid container spacing={2}>
            {conversations.map((conversation) => (
              <Grid item xs={12} sm={6} md={4} key={conversation.id}>
                <ConversationCard
                  userName={conversation.userName}
                  userInitials={conversation.userInitials}
                  lastMessage={conversation.lastMessage}
                  timestamp={conversation.timestamp}
                  unread={conversation.unread}
                  onClick={() => onConversationClick(conversation)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};
