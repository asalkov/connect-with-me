import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { IMessageRepository } from './repositories/message.repository.interface';
import { DynamoDBMessageRepository } from './repositories/dynamodb-message.repository';
import { TypeORMMessageRepository } from './repositories/typeorm-message.repository';
import { DynamoDBService } from '../database/dynamodb';

@Injectable()
export class MessagesService {
  private messageRepository: IMessageRepository;

  constructor(
    private configService: ConfigService,
    @Optional() @InjectRepository(Message)
    private typeormRepository: Repository<Message>,
    private dynamoDBService: DynamoDBService,
  ) {
    // Initialize the appropriate repository
    const useDynamoDB = this.configService.get('DYNAMODB_MESSAGES_TABLE');
    
    if (useDynamoDB) {
      console.log('Using DynamoDB Message Repository');
      this.messageRepository = new DynamoDBMessageRepository(this.dynamoDBService);
    } else {
      console.log('Using TypeORM Message Repository');
      this.messageRepository = new TypeORMMessageRepository(this.typeormRepository);
    }
  }

  async create(messageData: any): Promise<Message> {
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
