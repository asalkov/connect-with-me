import { useState } from 'react';
import { useSelector } from 'react-redux';
import { MainLayout } from '../components/layout';
import { ConversationListView } from '../components/chat/ConversationListView';
import { MessageView } from '../components/chat/MessageView';
import { StartChatModal } from '../components/chat/StartChatModal';
import { useConversations, ConversationDisplay } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { useUserSearch } from '../hooks/useUserSearch';
import { conversationsService } from '../services/conversations.api';
import { messagesService } from '../services/messages.api';
import { User as ApiUser } from '../types/user';
import { getUserDisplayName, getUserInitials } from '../utils/userHelpers';
import { RootState } from '../store';

export const ChatPage = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDisplay | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showStartChatModal, setShowStartChatModal] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Custom hooks
  const { conversations, isLoading: isLoadingConversations, updateConversationLastMessage, addConversation } = useConversations(currentUser?.id);
  const { messages, isLoading: isLoadingMessages, addMessage } = useMessages(selectedConversation?.id || null, currentUser?.id);
  const { searchQuery, setSearchQuery, searchResults, isSearching, error: searchError } = useUserSearch(currentUser?.id);

  // Handlers
  const handleConversationClick = (conversation: ConversationDisplay) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const handleStartChat = () => {
    setShowStartChatModal(true);
    setSearchQuery('');
  };

  const handleCloseModal = () => {
    setShowStartChatModal(false);
    setSearchQuery('');
  };

  const handleUserSelect = async (user: ApiUser) => {
    try {
      // Check if conversation already exists with this user
      const existingConv = conversations.find((conv) => conv.participantIds.includes(user.id));

      if (existingConv) {
        setSelectedConversation(existingConv);
        handleCloseModal();
        return;
      }

      // Create new conversation via API
      const newConversation = await conversationsService.createConversation({
        type: 'direct',
        participantIds: [user.id],
      });

      const newConvDisplay: ConversationDisplay = {
        id: newConversation.id,
        userName: getUserDisplayName(user),
        userInitials: getUserInitials(user),
        lastMessage: 'No messages yet',
        timestamp: new Date(newConversation.createdAt).toLocaleDateString(),
        participantIds: newConversation.participants,
      };

      addConversation(newConvDisplay);
      setSelectedConversation(newConvDisplay);
      handleCloseModal();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || isSendingMessage) {
      return;
    }

    try {
      setIsSendingMessage(true);

      // Send message via API
      const newMessage = await messagesService.sendMessage({
        content: messageText.trim(),
        conversationId: selectedConversation.id,
        type: 'text',
      });

      addMessage({
        id: newMessage.id,
        content: newMessage.content,
        timestamp: new Date(newMessage.createdAt).toLocaleTimeString(),
        isOwn: true,
      });

      setMessageText('');
      updateConversationLastMessage(selectedConversation.id, newMessage.content);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Render message view if conversation is selected
  if (selectedConversation) {
    return (
      <MainLayout>
        <MessageView
          conversation={selectedConversation}
          messages={messages}
          messageText={messageText}
          isLoadingMessages={isLoadingMessages}
          isSendingMessage={isSendingMessage}
          onBack={handleBackToList}
          onMessageChange={setMessageText}
          onSendMessage={handleSendMessage}
        />
      </MainLayout>
    );
  }

  // Render conversation list
  return (
    <MainLayout>
      <ConversationListView
        conversations={conversations}
        isLoading={isLoadingConversations}
        onConversationClick={handleConversationClick}
        onStartChat={handleStartChat}
      />

      <StartChatModal
        open={showStartChatModal}
        searchQuery={searchQuery}
        searchResults={searchResults}
        isSearching={isSearching}
        error={searchError}
        onClose={handleCloseModal}
        onSearchChange={setSearchQuery}
        onUserSelect={handleUserSelect}
      />
    </MainLayout>
  );
};
