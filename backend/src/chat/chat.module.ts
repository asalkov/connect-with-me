import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { MessagesModule } from '../messages/messages.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MessagesModule.forRoot(),
    ConversationsModule.forRoot(),
    UsersModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '7d'),
        },
      }),
    }),
  ],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
