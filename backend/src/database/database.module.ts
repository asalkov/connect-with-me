import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const isProduction = process.env.NODE_ENV === 'production';
    const useDynamoDB = process.env.DYNAMODB_USERS_TABLE !== undefined;

    // In production with DynamoDB, skip TypeORM entirely
    // TODO: Implement proper DynamoDB repositories
    if (isProduction && useDynamoDB) {
      return {
        module: DatabaseModule,
        imports: [],
        exports: [],
      };
    }

    // For local development, use TypeORM with SQLite file
    return {
      module: DatabaseModule,
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
    };
  }
}
