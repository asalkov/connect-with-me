import { Conversation, ConversationType } from '../types/conversation.types';

export interface CreateConversationData {
  type: ConversationType;
  name?: string;
  description?: string;
  avatarUrl?: string;
  createdBy: string;
  participantIds: string[];
}

export interface UpdateConversationData {
  name?: string;
  description?: string;
  avatarUrl?: string;
  isActive?: boolean;
  lastMessageAt?: Date | string;
}

export interface FindConversationsParams {
  userId: string;
  limit?: number;
  cursor?: string;
}

export interface FindConversationsResult {
  conversations: Conversation[];
  nextCursor?: string;
}

export interface IConversationRepository {
  /**
   * Create a new conversation
   */
  create(conversationData: CreateConversationData): Promise<Conversation>;

  /**
   * Find conversation by ID
   */
  findById(id: string): Promise<Conversation | null>;

  /**
   * Find all conversations for a user
   */
  findByUserId(params: FindConversationsParams): Promise<FindConversationsResult>;

  /**
   * Find direct conversation between two users
   */
  findDirectConversation(userId1: string, userId2: string): Promise<Conversation | null>;

  /**
   * Update conversation
   */
  update(id: string, conversationData: UpdateConversationData): Promise<Conversation>;

  /**
   * Delete conversation
   */
  delete(id: string): Promise<void>;

  /**
   * Add participant to conversation
   */
  addParticipant(conversationId: string, userId: string): Promise<void>;

  /**
   * Remove participant from conversation
   */
  removeParticipant(conversationId: string, userId: string): Promise<void>;

  /**
   * Get conversation participants
   */
  getParticipants(conversationId: string): Promise<string[]>;

  /**
   * Check if user is participant
   */
  isParticipant(conversationId: string, userId: string): Promise<boolean>;

  /**
   * Update last message timestamp
   */
  updateLastMessageAt(conversationId: string, timestamp: Date | string): Promise<void>;
}
