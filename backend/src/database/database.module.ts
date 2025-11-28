import { Module, DynamicModule } from '@nestjs/common';
import { DynamoDBModule } from './dynamodb';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    console.log('🚀 Database Module: Using DynamoDB');
    
    return {
      module: DatabaseModule,
      imports: [DynamoDBModule],
      exports: [DynamoDBModule],
    };
  }
}
