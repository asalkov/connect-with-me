import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { DynamoDBService } from '../database/dynamodb';
import { DynamoDBUserRepository } from './repositories/dynamodb-user.repository';
import { TypeORMUserRepository } from './repositories/typeorm-user.repository';

@Module({})
export class UsersModule {
  static forRoot(): DynamicModule {
    const useDynamoDB = process.env.DYNAMODB_USERS_TABLE !== undefined;

    const imports: any[] = [];
    
    // Only import TypeORM in development
    if (!useDynamoDB) {
      imports.push(TypeOrmModule.forFeature([User]));
    }

    return {
      module: UsersModule,
      imports,
      controllers: [UsersController],
      providers: [
        {
          provide: 'USER_REPOSITORY',
          useFactory: (
            configService: ConfigService,
            dynamoDBService: DynamoDBService,
          ) => {
            const useDynamoDB = configService.get('DYNAMODB_USERS_TABLE');

            if (useDynamoDB) {
              console.log('📦 Users Module: Using DynamoDB User Repository');
              return new DynamoDBUserRepository(dynamoDBService);
            }

            console.log('📦 Users Module: Using TypeORM User Repository');
            // TypeORM repository will be injected separately
            return null;
          },
          inject: [ConfigService, DynamoDBService],
        },
        UsersService,
      ],
      exports: [UsersService],
    };
  }
}
