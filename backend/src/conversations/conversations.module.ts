import { Module, DynamicModule } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';

@Module({})
export class ConversationsModule {
  static forRoot(): DynamicModule {
    return {
      module: ConversationsModule,
      imports: [
        DatabaseModule,
        UsersModule.forRoot(),
      ],
      controllers: [ConversationsController],
      providers: [ConversationsService],
      exports: [ConversationsService],
    };
  }
}
