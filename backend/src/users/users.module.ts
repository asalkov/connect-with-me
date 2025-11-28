import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DynamoDBService } from '../database/dynamodb';
import { DynamoDBUserRepository } from './repositories/dynamodb-user.repository';

@Module({})
export class UsersModule {
  static forRoot(): DynamicModule {
    return {
      module: UsersModule,
      imports: [],
      controllers: [UsersController],
      providers: [
        {
          provide: 'USER_REPOSITORY',
          useFactory: (
            configService: ConfigService,
            dynamoDBService: DynamoDBService,
          ) => {
            console.log('📦 Users Module: Using DynamoDB User Repository');
            return new DynamoDBUserRepository(dynamoDBService);
          },
          inject: [ConfigService, DynamoDBService],
        },
        UsersService,
      ],
      exports: [UsersService],
    };
  }
}
