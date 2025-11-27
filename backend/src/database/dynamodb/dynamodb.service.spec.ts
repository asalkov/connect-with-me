import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DynamoDBService } from './dynamodb.service';

describe('DynamoDBService', () => {
  let service: DynamoDBService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DynamoDBService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config: Record<string, any> = {
                AWS_REGION: 'us-east-1',
                DYNAMODB_USERS_TABLE: 'chat-users-dev',
                DYNAMODB_CONVERSATIONS_TABLE: 'chat-conversations-dev',
                DYNAMODB_MESSAGES_TABLE: 'chat-messages-dev',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DynamoDBService>(DynamoDBService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return DynamoDB document client', () => {
    const client = service.getDocClient();
    expect(client).toBeDefined();
  });

  it('should return correct table names', () => {
    expect(service.getTableName('users')).toBe('chat-users-dev');
    expect(service.getTableName('conversations')).toBe('chat-conversations-dev');
    expect(service.getTableName('messages')).toBe('chat-messages-dev');
  });

  it('should detect local endpoint', () => {
    expect(service.isLocalEndpoint()).toBe(false);
  });
});
