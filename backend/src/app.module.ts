import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { ChatModule } from './chat/chat.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({})
export class AppModule {
  static forRoot(): DynamicModule {
    const isProduction = process.env.NODE_ENV === 'production';
    const useDynamoDB = process.env.DYNAMODB_USERS_TABLE !== undefined;

    const imports: any[] = [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      DatabaseModule.forRoot(),
    ];

    const providers: any[] = [AppService];

    // Always load Auth, Users, Conversations, Messages, and Chat modules (they now support both TypeORM and DynamoDB)
    imports.push(AuthModule, UsersModule.forRoot(), ConversationsModule.forRoot(), MessagesModule.forRoot(), ChatModule);
    providers.push({
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    });

    return {
      module: AppModule,
      imports,
      controllers: [AppController],
      providers,
    };
  }
}
