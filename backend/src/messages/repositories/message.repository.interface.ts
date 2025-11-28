import { Message } from '../types/message.types';

export interface CreateMessageData {
  content: string;
  type?: string;
  senderId: string;
  conversationId: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  metadata?: Record<string, any>;
}

export interface UpdateMessageData {
  content?: string;
  status?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  deletedAt?: Date;
  metadata?: Record<string, any>;
}

export interface FindMessagesParams {
  conversationId: string;
  limit?: number;
  cursor?: string;
  beforeTimestamp?: string;
}

export interface FindMessagesResult {
  messages: Message[];
  nextCursor?: string;
}

export interface IMessageRepository {
  create(messageData: CreateMessageData): Promise<Message>;
  findById(id: string): Promise<Message | null>;
  findByConversationId(params: FindMessagesParams): Promise<FindMessagesResult>;
  update(id: string, messageData: UpdateMessageData): Promise<Message>;
  delete(id: string): Promise<void>;
  markAsRead(messageId: string, userId: string): Promise<void>;
  markConversationAsRead(conversationId: string, userId: string): Promise<void>;
}
