import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { Message } from '../entities/message.entity';

@Module({})
export class MessagesModule {
  static forRoot(): DynamicModule {
    const useDynamoDB = process.env.DYNAMODB_MESSAGES_TABLE !== undefined;

    const imports: any[] = [];
    
    // Only import TypeORM if not using DynamoDB
    if (!useDynamoDB) {
      imports.push(TypeOrmModule.forFeature([Message]));
    }

    return {
      module: MessagesModule,
      imports,
      providers: [MessagesService],
      exports: [MessagesService],
    };
  }
}
