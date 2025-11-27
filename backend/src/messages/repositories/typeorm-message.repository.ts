import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Message, MessageStatus } from '../../entities/message.entity';
import {
  IMessageRepository,
  CreateMessageData,
  UpdateMessageData,
  FindMessagesParams,
  FindMessagesResult,
} from './message.repository.interface';

@Injectable()
export class TypeORMMessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(messageData: CreateMessageData): Promise<Message> {
    const message = this.messageRepository.create({
      content: messageData.content,
      type: messageData.type as any,
      senderId: messageData.senderId,
      conversationId: messageData.conversationId,
      fileUrl: messageData.fileUrl,
      fileName: messageData.fileName,
      fileSize: messageData.fileSize,
      fileMimeType: messageData.fileMimeType,
      metadata: messageData.metadata,
    });
    return await this.messageRepository.save(message);
  }

  async findById(id: string): Promise<Message | null> {
    return await this.messageRepository.findOne({ where: { id } });
  }

  async findByConversationId(params: FindMessagesParams): Promise<FindMessagesResult> {
    const { conversationId, limit = 50, beforeTimestamp } = params;

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'DESC')
      .take(limit);

    if (beforeTimestamp) {
      queryBuilder.andWhere('message.createdAt < :beforeTimestamp', {
        beforeTimestamp: new Date(beforeTimestamp),
      });
    }

    const messages = await queryBuilder.getMany();

    return { messages };
  }

  async update(id: string, messageData: UpdateMessageData): Promise<Message> {
    await this.messageRepository.update(id, messageData as any);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.messageRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    await this.messageRepository.update(messageId, {
      status: MessageStatus.READ,
    });
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ status: MessageStatus.READ })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('status != :readStatus', { readStatus: MessageStatus.READ })
      .execute();
  }
}
