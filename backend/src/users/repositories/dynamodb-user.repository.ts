import { Injectable } from '@nestjs/common';
import {
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBService } from '../../database/dynamodb';
import { BaseDynamoDBRepository } from '../../database/dynamodb/base-dynamodb.repository';
import { User, UserStatus } from '../../types/user.types';
import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
  SearchUsersParams,
  SearchUsersResult,
} from './user.repository.interface';

@Injectable()
export class DynamoDBUserRepository extends BaseDynamoDBRepository<User> implements IUserRepository {
  constructor(dynamoDBService: DynamoDBService) {
    super(dynamoDBService, 'users');
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
      this.logSuccess('User created', user.id);
      return user;
    } catch (error) {
      this.logError('creating user', error);
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
      
      return this.cleanDynamoDBKeys(result.Item) as User;
    } catch (error) {
      this.logError('finding user by ID', error, id);
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
      
      return this.cleanDynamoDBKeys(result.Items[0]) as User;
    } catch (error) {
      this.logError('finding user by email', error, email);
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
      
      return this.cleanDynamoDBKeys(result.Items[0]) as User;
    } catch (error) {
      this.logError('finding user by username', error, username);
      throw error;
    }
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    if (Object.keys(userData).length === 0) {
      // No updates to perform, just return the existing user
      return this.findById(id);
    }

    const key = {
      PK: `USER#${id}`,
      SK: `USER#${id}`,
    };

    return this.executeUpdate(key, userData) as Promise<User>;
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
      this.logSuccess('User deleted', id);
    } catch (error) {
      this.logError('deleting user', error, id);
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
        this.logError('scanning users', error);
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
      this.logError('searching users', error, `query: ${query}`);
      throw error;
    }
  }
}
