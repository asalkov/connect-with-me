import { useState, useEffect } from 'react';
import { messagesService } from '../services/messages.api';

export interface MessageDisplay {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export const useMessages = (conversationId: string | null, currentUserId?: string) => {
  const [messages, setMessages] = useState<MessageDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMessages = async (convId: string) => {
    if (!currentUserId) return;

    try {
      setIsLoading(true);
      const response = await messagesService.getMessages(convId, 50);

      const messagesDisplay: MessageDisplay[] = response.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString(),
        isOwn: msg.senderId === currentUserId,
      }));

      setMessages(messagesDisplay.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (message: MessageDisplay) => {
    setMessages((prev) => [...prev, message]);
  };

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId, currentUserId]);

  return {
    messages,
    isLoading,
    loadMessages,
    addMessage,
  };
};
