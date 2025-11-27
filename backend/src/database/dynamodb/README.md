# DynamoDB Module

This module provides DynamoDB integration for the chat application, supporting both local development (DynamoDB Local) and AWS production environments.

## 📁 Structure

```
dynamodb/
├── dynamodb.service.ts          # DynamoDB client wrapper
├── dynamodb.module.ts           # NestJS module
├── setup-tables.ts              # Table creation script
├── seed-data.ts                 # Test data seeding script
└── repositories/
    └── user.repository.ts       # User CRUD operations
```

## 🔧 DynamoDB Service

The `DynamoDBService` provides a configured DynamoDB Document Client that automatically switches between local and AWS environments.

```typescript
import { DynamoDBService } from './dynamodb.service';

@Injectable()
export class YourService {
  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async example() {
    const docClient = this.dynamoDBService.getDocClient();
    const tableName = this.dynamoDBService.getTableName('users');
    
    // Use docClient for operations
  }
}
```

## 📊 Repositories

### User Repository

Provides complete CRUD operations for users:

```typescript
import { UserRepository } from './repositories/user.repository';

// Create
const user = await userRepository.create({
  email: 'user@example.com',
  username: 'username',
  password: hashedPassword,
});

// Read
const user = await userRepository.findById(userId);
const user = await userRepository.findByEmail('user@example.com');
const user = await userRepository.findByUsername('username');

// Update
await userRepository.update(userId, { firstName: 'Jane' });
await userRepository.updatePassword(userId, newHashedPassword);
await userRepository.updateStatus(userId, 'online');

// Delete (soft delete)
await userRepository.delete(userId);
```

## 🛠️ Scripts

### Setup Tables

Creates all required DynamoDB tables:

```bash
npm run dynamodb:setup
```

Creates:
- `chat-users-dev`
- `chat-messages-dev`
- `chat-conversations-dev`

### Seed Data

Populates tables with test data:

```bash
npm run dynamodb:seed
```

Creates:
- 3 test users (alice, bob, charlie)
- 1 conversation
- 4 test messages

## 🔑 Environment Variables

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local

# DynamoDB Configuration
DYNAMODB_ENDPOINT=http://localhost:8000  # Local only

# Table Names
DYNAMODB_USERS_TABLE=chat-users-dev
DYNAMODB_MESSAGES_TABLE=chat-messages-dev
DYNAMODB_CONVERSATIONS_TABLE=chat-conversations-dev
```

## 🏗️ Adding New Repositories

Follow this pattern to create new repositories:

```typescript
import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../dynamodb.service';
import { PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class YourRepository {
  constructor(private readonly dynamoDBService: DynamoDBService) {}

  private get tableName(): string {
    return this.dynamoDBService.getTableName('your-table');
  }

  async create(data: any) {
    await this.dynamoDBService.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: data,
      })
    );
  }

  async findById(id: string) {
    const result = await this.dynamoDBService.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: `PREFIX#${id}`, SK: 'METADATA' },
      })
    );
    return result.Item;
  }
}
```

## 📚 Documentation

- [Full Setup Guide](../../../../../DYNAMODB-SETUP.md)
- [Quick Start](../../../DYNAMODB-QUICK-START.md)
- [Integration Summary](../../../../../DYNAMODB-INTEGRATION-SUMMARY.md)
