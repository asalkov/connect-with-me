import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message } from './types/message.types';
import { IMessageRepository } from './repositories/message.repository.interface';
import { DynamoDBMessageRepository } from './repositories/dynamodb-message.repository';
import { DynamoDBService } from '../database/dynamodb';

@Injectable()
export class MessagesService {
  private messageRepository: IMessageRepository;

  constructor(
    private configService: ConfigService,
    private dynamoDBService: DynamoDBService,
  ) {
    console.log('📨 Messages Service: Using DynamoDB Repository');
    this.messageRepository = new DynamoDBMessageRepository(this.dynamoDBService);
  }

  async create(messageData: any): Promise<any> {
    return await this.messageRepository.create(messageData);
  }

  async findById(id: string): Promise<Message> {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async findByConversationId(params: any) {
    return await this.messageRepository.findByConversationId(params);
  }

  async update(id: string, messageData: any): Promise<Message> {
    await this.findById(id); // Ensure message exists
    return await this.messageRepository.update(id, messageData);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Ensure message exists
    await this.messageRepository.delete(id);
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    await this.messageRepository.markAsRead(messageId, userId);
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageRepository.markConversationAsRead(conversationId, userId);
  }
}
