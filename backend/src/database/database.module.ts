import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get('DATABASE_PATH', 'data/chat.db'),
        entities: [User, Conversation, Message],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forFeature([User, Conversation, Message]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
