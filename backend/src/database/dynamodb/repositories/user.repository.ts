import { Injectable } from '@nestjs/common';
import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBService } from '../dynamodb.service';
import { v4 as uuidv4 } from 'uuid';

export interface DynamoDBUser {
  PK: string;           // USER#<userId>
  SK: string;           // PROFILE
  id: string;
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeenAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class UserRepository {
  constructor(private readonly dynamoDBService: DynamoDBService) {}

  private get tableName(): string {
    return this.dynamoDBService.getTableName('users');
  }

  async create(userData: Partial<DynamoDBUser>): Promise<DynamoDBUser> {
    const userId = uuidv4();
    const now = new Date().toISOString();

    const user: DynamoDBUser = {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
      id: userId,
      email: userData.email!,
      username: userData.username!,
      password: userData.password!,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      avatarUrl: userData.avatarUrl || null,
      bio: userData.bio || null,
      status: userData.status || 'offline',
      lastSeenAt: userData.lastSeenAt || null,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: now,
      updatedAt: now,
    };

    await this.dynamoDBService.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: user,
        ConditionExpression: 'attribute_not_exists(PK)',
      })
    );

    return user;
  }

  async findById(id: string): Promise<DynamoDBUser | null> {
    const result = await this.dynamoDBService.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${id}`,
          SK: 'PROFILE',
        },
      })
    );

    return (result.Item as DynamoDBUser) || null;
  }

  async findByEmail(email: string): Promise<DynamoDBUser | null> {
    const result = await this.dynamoDBService.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email,
        },
        Limit: 1,
      })
    );

    return result.Items && result.Items.length > 0 ? (result.Items[0] as DynamoDBUser) : null;
  }

  async findByUsername(username: string): Promise<DynamoDBUser | null> {
    const result = await this.dynamoDBService.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'UsernameIndex',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
          ':username': username,
        },
        Limit: 1,
      })
    );

    return result.Items && result.Items.length > 0 ? (result.Items[0] as DynamoDBUser) : null;
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<DynamoDBUser | null> {
    // Try email first
    let user = await this.findByEmail(emailOrUsername);
    if (user) return user;

    // Try username
    user = await this.findByUsername(emailOrUsername);
    return user;
  }

  async update(id: string, updates: Partial<DynamoDBUser>): Promise<DynamoDBUser> {
    const now = new Date().toISOString();
    
    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    const allowedFields = ['firstName', 'lastName', 'avatarUrl', 'bio', 'status', 'lastSeenAt', 'isActive'];
    
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updateExpressions.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = updates[field];
      }
    });

    // Always update updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now;

    await this.dynamoDBService.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${id}`,
          SK: 'PROFILE',
        },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );

    return this.findById(id);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const now = new Date().toISOString();

    await this.dynamoDBService.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${id}`,
          SK: 'PROFILE',
        },
        UpdateExpression: 'SET #password = :password, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#password': 'password',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':password': hashedPassword,
          ':updatedAt': now,
        },
      })
    );
  }

  async updateStatus(id: string, status: 'online' | 'offline' | 'away'): Promise<void> {
    const now = new Date().toISOString();

    await this.dynamoDBService.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${id}`,
          SK: 'PROFILE',
        },
        UpdateExpression: 'SET #status = :status, #lastSeenAt = :lastSeenAt, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#lastSeenAt': 'lastSeenAt',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':lastSeenAt': now,
          ':updatedAt': now,
        },
      })
    );
  }

  async delete(id: string): Promise<void> {
    await this.dynamoDBService.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${id}`,
          SK: 'PROFILE',
        },
        UpdateExpression: 'SET #isActive = :isActive, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#isActive': 'isActive',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':isActive': false,
          ':updatedAt': new Date().toISOString(),
        },
      })
    );
  }
}
