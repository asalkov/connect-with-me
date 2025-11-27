import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Conversation } from '../entities/conversation.entity';
import { User } from '../entities/user.entity';
import { DynamoDBService } from '../database/dynamodb';
import { DynamoDBConversationRepository } from './repositories/dynamodb-conversation.repository';
import { TypeORMConversationRepository } from './repositories/typeorm-conversation.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, User])],
  controllers: [ConversationsController],
  providers: [
    {
      provide: 'CONVERSATION_REPOSITORY',
      useFactory: (
        configService: ConfigService,
        dynamoDBService?: DynamoDBService,
      ) => {
        const useDynamoDB = configService.get('DYNAMODB_CONVERSATIONS_TABLE');
        
        if (useDynamoDB && dynamoDBService) {
          console.log('Using DynamoDB Conversation Repository');
          return new DynamoDBConversationRepository(dynamoDBService);
        }
        
        console.log('Using TypeORM Conversation Repository');
        return null; // Will be replaced by TypeORMConversationRepository
      },
      inject: [ConfigService, DynamoDBService],
    },
    ConversationsService,
  ],
  exports: [ConversationsService],
})
export class ConversationsModule {}
