import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Conversation, ConversationType } from '../../entities/conversation.entity';
import { User } from '../../entities/user.entity';
import {
  IConversationRepository,
  CreateConversationData,
  UpdateConversationData,
  FindConversationsParams,
  FindConversationsResult,
} from './conversation.repository.interface';

@Injectable()
export class TypeORMConversationRepository implements IConversationRepository {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(conversationData: CreateConversationData): Promise<Conversation> {
    // Find participant users
    const participants = await this.userRepository.find({
      where: {
        id: In(conversationData.participantIds),
      },
    });

    const conversation = this.conversationRepository.create({
      type: conversationData.type,
      name: conversationData.name,
      description: conversationData.description,
      avatarUrl: conversationData.avatarUrl,
      createdBy: conversationData.createdBy,
      participants,
    });

    return await this.conversationRepository.save(conversation);
  }

  async findById(id: string): Promise<Conversation | null> {
    return await this.conversationRepository.findOne({
      where: { id },
      relations: ['participants'],
    });
  }

  async findByUserId(params: FindConversationsParams): Promise<FindConversationsResult> {
    const { userId, limit = 20 } = params;

    const query = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .where('participant.id = :userId', { userId })
      .orderBy('conversation.lastMessageAt', 'DESC')
      .take(limit);

    const conversations = await query.getMany();

    return {
      conversations,
      nextCursor: undefined, // TypeORM doesn't use cursor pagination
    };
  }

  async findDirectConversation(userId1: string, userId2: string): Promise<Conversation | null> {
    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .where('conversation.type = :type', { type: ConversationType.DIRECT })
      .andWhere('participant.id IN (:...userIds)', { userIds: [userId1, userId2] })
      .groupBy('conversation.id')
      .having('COUNT(DISTINCT participant.id) = 2')
      .getOne();

    return conversation || null;
  }

  async update(id: string, conversationData: UpdateConversationData): Promise<Conversation> {
    await this.conversationRepository.update(id, conversationData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.conversationRepository.delete(id);
  }

  async addParticipant(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already a participant
    const isAlreadyParticipant = conversation.participants.some((p) => p.id === userId);
    if (!isAlreadyParticipant) {
      conversation.participants.push(user);
      await this.conversationRepository.save(conversation);
    }
  }

  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.participants = conversation.participants.filter((p) => p.id !== userId);
    await this.conversationRepository.save(conversation);
  }

  async getParticipants(conversationId: string): Promise<string[]> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      return [];
    }

    return conversation.participants.map((p) => p.id);
  }

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      return false;
    }

    return conversation.participants.some((p) => p.id === userId);
  }

  async updateLastMessageAt(conversationId: string, timestamp: Date | string): Promise<void> {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    await this.conversationRepository.update(conversationId, {
      lastMessageAt: date,
    });
  }
}
