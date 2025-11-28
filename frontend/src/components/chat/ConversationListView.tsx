import { Box, Typography, Button, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, Badge, InputBase, IconButton, Divider } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { ConversationDisplay } from '../../hooks/useConversations';
import { ConversationSkeleton } from './ConversationSkeleton';
import { useState } from 'react';

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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Conversations
          </Typography>
          <IconButton color="primary" onClick={onStartChat} size="small">
            <AddIcon />
          </IconButton>
        </Box>

        {/* Search Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'action.hover',
            borderRadius: 2,
            px: 2,
            py: 0.5,
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, fontSize: '0.875rem' }}
          />
        </Box>
      </Box>

      {/* Conversation List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <ConversationSkeleton count={5} />
        ) : filteredConversations.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </Typography>
            {!searchQuery && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onStartChat}
                sx={{ mt: 2 }}
              >
                Start Chat
              </Button>
            )}
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredConversations.map((conversation, index) => (
              <Box key={conversation.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => onConversationClick(conversation)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={conversation.unread}
                        color="primary"
                        overlap="circular"
                      >
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 48,
                            height: 48,
                          }}
                        >
                          {conversation.userInitials}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          fontWeight={conversation.unread ? 600 : 400}
                          sx={{ mb: 0.5 }}
                        >
                          {conversation.userName}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: conversation.unread ? 500 : 400,
                          }}
                        >
                          {conversation.lastMessage}
                        </Typography>
                      }
                    />
                    <Box sx={{ ml: 2, textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">
                        {conversation.timestamp}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
                {index < filteredConversations.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};
