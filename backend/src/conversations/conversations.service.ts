import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, ConversationType } from '../entities/conversation.entity';
import { User } from '../entities/user.entity';
import { IConversationRepository, CreateConversationData } from './repositories/conversation.repository.interface';
import { DynamoDBConversationRepository } from './repositories/dynamodb-conversation.repository';
import { TypeORMConversationRepository } from './repositories/typeorm-conversation.repository';
import { DynamoDBService } from '../database/dynamodb';

@Injectable()
export class ConversationsService {
  private conversationRepository: IConversationRepository;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Conversation)
    private typeormConversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private typeormUserRepository: Repository<User>,
    private dynamoDBService: DynamoDBService,
  ) {
    // Initialize the appropriate repository
    const useDynamoDB = this.configService.get('DYNAMODB_CONVERSATIONS_TABLE');
    
    if (useDynamoDB) {
      this.conversationRepository = new DynamoDBConversationRepository(this.dynamoDBService);
    } else {
      this.conversationRepository = new TypeORMConversationRepository(
        this.typeormConversationRepository,
        this.typeormUserRepository,
      );
    }
  }

  async createConversation(
    userId: string,
    data: {
      type: ConversationType;
      participantIds: string[];
      name?: string;
      description?: string;
    },
  ): Promise<Conversation> {
    // Ensure creator is included in participants
    const participantIds = Array.from(new Set([userId, ...data.participantIds]));

    // For direct conversations, ensure only 2 participants
    if (data.type === ConversationType.DIRECT && participantIds.length !== 2) {
      throw new ForbiddenException('Direct conversations must have exactly 2 participants');
    }

    // Check if direct conversation already exists
    if (data.type === ConversationType.DIRECT) {
      const otherUserId = participantIds.find((id) => id !== userId);
      const existing = await this.conversationRepository.findDirectConversation(userId, otherUserId);
      if (existing) {
        return existing;
      }
    }

    const conversationData: CreateConversationData = {
      type: data.type,
      name: data.name,
      description: data.description,
      createdBy: userId,
      participantIds,
    };

    return await this.conversationRepository.create(conversationData);
  }

  async findById(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findById(id);
    
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    // Verify user is a participant
    const isParticipant = await this.conversationRepository.isParticipant(id, userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    return conversation;
  }

  async findUserConversations(userId: string, limit?: number): Promise<Conversation[]> {
    const result = await this.conversationRepository.findByUserId({
      userId,
      limit,
    });

    return result.conversations;
  }

  async updateConversation(
    id: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      avatarUrl?: string;
    },
  ): Promise<Conversation> {
    // Verify user is a participant
    const conversation = await this.findById(id, userId);

    // Only creator or admin can update group conversations
    if (conversation.type === ConversationType.GROUP && conversation.createdBy !== userId) {
      throw new ForbiddenException('Only the creator can update this conversation');
    }

    return await this.conversationRepository.update(id, data);
  }

  async deleteConversation(id: string, userId: string): Promise<void> {
    const conversation = await this.findById(id, userId);

    // Only creator can delete
    if (conversation.createdBy !== userId) {
      throw new ForbiddenException('Only the creator can delete this conversation');
    }

    await this.conversationRepository.delete(id);
  }

  async addParticipant(conversationId: string, userId: string, newParticipantId: string): Promise<void> {
    const conversation = await this.findById(conversationId, userId);

    // Only group conversations can add participants
    if (conversation.type !== ConversationType.GROUP) {
      throw new ForbiddenException('Cannot add participants to direct conversations');
    }

    // Only creator can add participants
    if (conversation.createdBy !== userId) {
      throw new ForbiddenException('Only the creator can add participants');
    }

    await this.conversationRepository.addParticipant(conversationId, newParticipantId);
  }

  async removeParticipant(conversationId: string, userId: string, participantId: string): Promise<void> {
    const conversation = await this.findById(conversationId, userId);

    // Only group conversations can remove participants
    if (conversation.type !== ConversationType.GROUP) {
      throw new ForbiddenException('Cannot remove participants from direct conversations');
    }

    // Creator can remove anyone, or users can remove themselves
    if (conversation.createdBy !== userId && participantId !== userId) {
      throw new ForbiddenException('You can only remove yourself or you must be the creator');
    }

    await this.conversationRepository.removeParticipant(conversationId, participantId);
  }

  async leaveConversation(conversationId: string, userId: string): Promise<void> {
    await this.removeParticipant(conversationId, userId, userId);
  }

  async getParticipants(conversationId: string, userId: string): Promise<string[]> {
    // Verify user is a participant
    await this.findById(conversationId, userId);

    return await this.conversationRepository.getParticipants(conversationId);
  }

  async updateLastMessageAt(conversationId: string, timestamp: Date): Promise<void> {
    await this.conversationRepository.updateLastMessageAt(conversationId, timestamp);
  }
}
