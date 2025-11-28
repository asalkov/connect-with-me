import { Module, DynamicModule } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { DynamoDBService } from '../database/dynamodb';

@Module({})
export class MessagesModule {
  static forRoot(): DynamicModule {
    return {
      module: MessagesModule,
      imports: [],
      controllers: [MessagesController],
      providers: [MessagesService, DynamoDBService],
      exports: [MessagesService],
    };
  }
}
