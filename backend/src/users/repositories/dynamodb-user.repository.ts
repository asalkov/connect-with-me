import { Injectable } from '@nestjs/common';
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBService } from '../../database/dynamodb';
import { User, UserStatus } from '../../types/user.types';
import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
  SearchUsersParams,
  SearchUsersResult,
} from './user.repository.interface';

@Injectable()
export class DynamoDBUserRepository implements IUserRepository {
  private tableName: string;

  constructor(private dynamoDBService: DynamoDBService) {
    this.tableName = this.dynamoDBService.getTableName('users');
  }

  async create(userData: CreateUserData): Promise<User> {
    const now = new Date();
    const userId = uuidv4();
    const user: User = {
      id: userId,
      email: userData.email,
      username: userData.username,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      status: (userData.status as UserStatus) || UserStatus.OFFLINE,
      avatarUrl: userData.avatarUrl,
      bio: null,
      isActive: true,
      lastSeenAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        PK: `USER#${userId}`,
        SK: `USER#${userId}`,
        ...user,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    });

    try {
      await this.dynamoDBService.getDocClient().send(command);
      console.log(`✅ User created in DynamoDB: ${user.id}`);
      return user;
    } catch (error) {
      console.error('❌ Error creating user in DynamoDB:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `USER#${id}`,
        SK: `USER#${id}`,
      },
    });

    try {
      const result = await this.dynamoDBService.getDocClient().send(command);
      if (!result.Item) return null;
      
      // Remove PK/SK from response
      const { PK, SK, ...user } = result.Item;
      return user as User;
    } catch (error) {
      console.error(`❌ Error finding user by ID ${id}:`, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
      Limit: 1,
    });

    try {
      const result = await this.dynamoDBService.getDocClient().send(command);
      if (!result.Items || result.Items.length === 0) return null;
      
      const { PK, SK, ...user } = result.Items[0];
      return user as User;
    } catch (error) {
      console.error(`❌ Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'UsernameIndex',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username,
      },
      Limit: 1,
    });

    try {
      const result = await this.dynamoDBService.getDocClient().send(command);
      if (!result.Items || result.Items.length === 0) return null;
      
      const { PK, SK, ...user } = result.Items[0];
      return user as User;
    } catch (error) {
      console.error(`❌ Error finding user by username ${username}:`, error);
      throw error;
    }
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Build update expression dynamically
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    // Always update updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date();

    if (updateExpressions.length === 0) {
      // No updates to perform, just return the existing user
      return this.findById(id);
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        PK: `USER#${id}`,
        SK: `USER#${id}`,
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    try {
      const result = await this.dynamoDBService.getDocClient().send(command);
      console.log(`✅ User updated in DynamoDB: ${id}`);
      const { PK, SK, ...user } = result.Attributes;
      return user as User;
    } catch (error) {
      console.error(`❌ Error updating user ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: {
        PK: `USER#${id}`,
        SK: `USER#${id}`,
      },
    });

    try {
      await this.dynamoDBService.getDocClient().send(command);
      console.log(`✅ User deleted from DynamoDB: ${id}`);
    } catch (error) {
      console.error(`❌ Error deleting user ${id}:`, error);
      throw error;
    }
  }

  async search(params: SearchUsersParams): Promise<SearchUsersResult> {
    const { query, limit = 20, cursor } = params;

    if (!query) {
      // Return all users if no query
      const command = new ScanCommand({
        TableName: this.tableName,
        Limit: limit,
        ExclusiveStartKey: cursor ? JSON.parse(cursor) : undefined,
      });

      try {
        const result = await this.dynamoDBService.getDocClient().send(command);
        return {
          users: (result.Items as User[]) || [],
          nextCursor: result.LastEvaluatedKey
            ? JSON.stringify(result.LastEvaluatedKey)
            : undefined,
        };
      } catch (error) {
        console.error('❌ Error scanning users:', error);
        throw error;
      }
    }

    // Search with filter expression
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression:
        'contains(#firstName, :query) OR contains(#lastName, :query) OR contains(#username, :query) OR contains(#email, :query)',
      ExpressionAttributeNames: {
        '#firstName': 'firstName',
        '#lastName': 'lastName',
        '#username': 'username',
        '#email': 'email',
      },
      ExpressionAttributeValues: {
        ':query': query,
      },
      Limit: limit,
      ExclusiveStartKey: cursor ? JSON.parse(cursor) : undefined,
    });

    try {
      const result = await this.dynamoDBService.getDocClient().send(command);
      return {
        users: (result.Items as User[]) || [],
        nextCursor: result.LastEvaluatedKey
          ? JSON.stringify(result.LastEvaluatedKey)
          : undefined,
      };
    } catch (error) {
      console.error(`❌ Error searching users with query "${query}":`, error);
      throw error;
    }
  }
}
