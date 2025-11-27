import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDBService {
  private client: DynamoDBClient;
  public docClient: DynamoDBDocumentClient;

  constructor(private configService: ConfigService) {
    const config: any = {
      region: this.configService.get('AWS_REGION', 'us-east-1'),
    };

    // Use local endpoint if specified (for development)
    const endpoint = this.configService.get('DYNAMODB_ENDPOINT');
    if (endpoint) {
      config.endpoint = endpoint;
      config.credentials = {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID', 'local'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY', 'local'),
      };
      console.log(`🔧 DynamoDB configured for local development: ${endpoint}`);
    } else {
      console.log('🔧 DynamoDB configured for AWS production');
    }

    this.client = new DynamoDBClient(config);
    this.docClient = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
    });
  }

  getDocClient() {
    return this.docClient;
  }

  getTableName(table: 'users' | 'messages' | 'conversations'): string {
    const tableMap = {
      users: this.configService.get('DYNAMODB_USERS_TABLE', 'chat-users-dev'),
      messages: this.configService.get('DYNAMODB_MESSAGES_TABLE', 'chat-messages-dev'),
      conversations: this.configService.get('DYNAMODB_CONVERSATIONS_TABLE', 'chat-conversations-dev'),
    };
    return tableMap[table];
  }

  isLocalEndpoint(): boolean {
    return !!this.configService.get('DYNAMODB_ENDPOINT');
  }
}
