import { useState, useEffect } from 'react';
import { conversationsService } from '../services/conversations.api';
import { getUserDisplayName, getUserInitials } from '../utils/userHelpers';

export interface ConversationDisplay {
  id: string;
  userName: string;
  userInitials: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
  participantIds: string[];
}

export const useConversations = (currentUserId?: string) => {
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadConversations = async () => {
    if (!currentUserId) return;

    try {
      setIsLoading(true);
      const apiConversations = await conversationsService.getConversations();

      const conversationsWithDetails = apiConversations.map((conv) => {
        // Use the otherUser field from the enriched conversation data
        let userName = 'Unknown User';
        let userInitials = 'U';

        if (conv.otherUser) {
          userName = getUserDisplayName(conv.otherUser);
          userInitials = getUserInitials(conv.otherUser);
        } else if (conv.type === 'group' && conv.name) {
          userName = conv.name;
          userInitials = conv.name.substring(0, 2).toUpperCase();
        }

        return {
          id: conv.id,
          userName,
          userInitials,
          lastMessage: conv.lastMessage?.content || 'No messages yet',
          timestamp: new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString(),
          participantIds: conv.participants.map(p => p.id),
        };
      });

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConversationLastMessage = (conversationId: string, message: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, lastMessage: message, timestamp: new Date().toLocaleDateString() }
          : conv
      )
    );
  };

  const addConversation = (conversation: ConversationDisplay) => {
    setConversations((prev) => [conversation, ...prev]);
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  return {
    conversations,
    isLoading,
    loadConversations,
    updateConversationLastMessage,
    addConversation,
  };
};
