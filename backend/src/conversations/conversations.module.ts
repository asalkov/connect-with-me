import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Conversation } from '../entities/conversation.entity';
import { User } from '../entities/user.entity';
import { DynamoDBService } from '../database/dynamodb';
import { DynamoDBConversationRepository } from './repositories/dynamodb-conversation.repository';
import { TypeORMConversationRepository } from './repositories/typeorm-conversation.repository';

@Module({})
export class ConversationsModule {
  static forRoot(): DynamicModule {
    const useDynamoDB = process.env.DYNAMODB_CONVERSATIONS_TABLE !== undefined;

    const imports: any[] = [];
    
    // Only import TypeORM if not using DynamoDB
    if (!useDynamoDB) {
      imports.push(TypeOrmModule.forFeature([Conversation, User]));
    }

    return {
      module: ConversationsModule,
      imports,
      controllers: [ConversationsController],
      providers: [ConversationsService],
      exports: [ConversationsService],
    };
  }
}
