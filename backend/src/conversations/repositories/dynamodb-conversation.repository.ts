import { Injectable } from '@nestjs/common';
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBService } from '../../database/dynamodb';
import { Conversation, ConversationType } from '../types/conversation.types';
import {
  IConversationRepository,
  CreateConversationData,
  UpdateConversationData,
  FindConversationsParams,
  FindConversationsResult,
} from './conversation.repository.interface';

@Injectable()
export class DynamoDBConversationRepository implements IConversationRepository {
  private tableName: string;

  constructor(private dynamoDBService: DynamoDBService) {
    this.tableName = this.dynamoDBService.getTableName('conversations');
  }

  async create(conversationData: CreateConversationData): Promise<Conversation> {
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: uuidv4(),
      type: conversationData.type,
      name: conversationData.name,
      description: conversationData.description,
      avatarUrl: conversationData.avatarUrl,
      createdBy: conversationData.createdBy,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: null,
      participants: [],
    };

    // Create main conversation record
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        PK: `CONVERSATION#${conversation.id}`,
        SK: 'METADATA',
        id: conversation.id,
        type: conversation.type,
        name: conversation.name,
        description: conversation.description,
        avatarUrl: conversation.avatarUrl,
        createdBy: conversation.createdBy,
        createdAt: now,
        updatedAt: now,
        lastMessageAt: null,
        participantIds: conversationData.participantIds,
        entityType: 'CONVERSATION',
        participants: conversation.participants,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    });

    await this.dynamoDBService.getDocClient().send(command);

    // Create participant records for GSI queries
    await this.createParticipantRecords(conversation.id, conversationData.participantIds, now);

    return conversation;
  }

  private async createParticipantRecords(
    conversationId: string,
    participantIds: string[],
    timestamp: string,
  ): Promise<void> {
    const requests = participantIds.map((userId) => ({
      PutRequest: {
        Item: {
          PK: `CONVERSATION#${conversationId}`,
          SK: `PARTICIPANT#${userId}`,
          GSI1PK: `USER#${userId}`,
          GSI1SK: `CONVERSATION#${timestamp}#${conversationId}`,
          conversationId,
          userId,
          joinedAt: timestamp,
          entityType: 'PARTICIPANT',
        },
      },
    }));

    // Batch write in chunks of 25 (DynamoDB limit)
    for (let i = 0; i < requests.length; i += 25) {
      const chunk = requests.slice(i, i + 25);
      await this.dynamoDBService.getDocClient().send(
        new BatchWriteCommand({
          RequestItems: {
            [this.tableName]: chunk,
          },
        }),
      );
    }
  }

  async findById(id: string): Promise<Conversation | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `CONVERSATION#${id}`,
        SK: 'METADATA',
      },
    });

    const result = await this.dynamoDBService.getDocClient().send(command);
    
    if (!result.Item) {
      return null;
    }

    return this.deserializeConversation(result.Item);
  }

  async findByUserId(params: FindConversationsParams): Promise<FindConversationsResult> {
    const { userId, limit = 20, cursor } = params;

    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'UserConversationsIndex',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'CONVERSATION#',
      },
      ScanIndexForward: false, // Most recent first
      Limit: limit,
      ExclusiveStartKey: cursor ? JSON.parse(cursor) : undefined,
    });

    const result = await this.dynamoDBService.getDocClient().send(command);

    // Get full conversation details for each
    const conversations = await Promise.all(
      (result.Items || []).map(async (item) => {
        const conversationId = item.conversationId;
        return this.findById(conversationId);
      }),
    );

    return {
      conversations: conversations.filter((c) => c !== null) as Conversation[],
      nextCursor: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : undefined,
    };
  }

  async findDirectConversation(userId1: string, userId2: string): Promise<Conversation | null> {
    // Get all conversations for user1
    const user1Conversations = await this.findByUserId({ userId: userId1, limit: 100 });

    // Filter for direct conversations that include user2
    for (const conversation of user1Conversations.conversations) {
      if (conversation.type === ConversationType.DIRECT) {
        const participants = await this.getParticipants(conversation.id);
        if (participants.includes(userId2) && participants.length === 2) {
          return conversation;
        }
      }
    }

    return null;
  }

  async update(id: string, conversationData: UpdateConversationData): Promise<Conversation> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Build update expression dynamically
    Object.entries(conversationData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        
        // Handle Date objects
        if (value instanceof Date) {
          expressionAttributeValues[`:${key}`] = value.toISOString();
        } else {
          expressionAttributeValues[`:${key}`] = value;
        }
      }
    });

    // Always update updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        PK: `CONVERSATION#${id}`,
        SK: 'METADATA',
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await this.dynamoDBService.getDocClient().send(command);
    return this.deserializeConversation(result.Attributes);
  }

  async delete(id: string): Promise<void> {
    // Delete main conversation record
    await this.dynamoDBService.getDocClient().send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          PK: `CONVERSATION#${id}`,
          SK: 'METADATA',
        },
      }),
    );

    // Delete all participant records
    const participants = await this.queryParticipantRecords(id);
    const deleteRequests = participants.map((item) => ({
      DeleteRequest: {
        Key: {
          PK: item.PK,
          SK: item.SK,
        },
      },
    }));

    // Batch delete in chunks of 25
    for (let i = 0; i < deleteRequests.length; i += 25) {
      const chunk = deleteRequests.slice(i, i + 25);
      await this.dynamoDBService.getDocClient().send(
        new BatchWriteCommand({
          RequestItems: {
            [this.tableName]: chunk,
          },
        }),
      );
    }
  }

  async addParticipant(conversationId: string, userId: string): Promise<void> {
    const now = new Date().toISOString();

    // Add participant record
    await this.dynamoDBService.getDocClient().send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `CONVERSATION#${conversationId}`,
          SK: `PARTICIPANT#${userId}`,
          GSI1PK: `USER#${userId}`,
          GSI1SK: `CONVERSATION#${now}#${conversationId}`,
          conversationId,
          userId,
          joinedAt: now,
          entityType: 'PARTICIPANT',
        },
      }),
    );

    // Update participantIds array in main record
    const conversation = await this.findById(conversationId);
    if (conversation) {
      const currentParticipants = await this.getParticipants(conversationId);
      if (!currentParticipants.includes(userId)) {
        await this.dynamoDBService.getDocClient().send(
          new UpdateCommand({
            TableName: this.tableName,
            Key: {
              PK: `CONVERSATION#${conversationId}`,
              SK: 'METADATA',
            },
            UpdateExpression: 'SET participantIds = list_append(if_not_exists(participantIds, :empty), :userId)',
            ExpressionAttributeValues: {
              ':userId': [userId],
              ':empty': [],
            },
          }),
        );
      }
    }
  }

  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    // Delete participant record
    await this.dynamoDBService.getDocClient().send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          PK: `CONVERSATION#${conversationId}`,
          SK: `PARTICIPANT#${userId}`,
        },
      }),
    );

    // Update participantIds array in main record
    const participants = await this.getParticipants(conversationId);
    const updatedParticipants = participants.filter((id) => id !== userId);

    await this.dynamoDBService.getDocClient().send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: `CONVERSATION#${conversationId}`,
          SK: 'METADATA',
        },
        UpdateExpression: 'SET participantIds = :participants',
        ExpressionAttributeValues: {
          ':participants': updatedParticipants,
        },
      }),
    );
  }

  async getParticipants(conversationId: string): Promise<string[]> {
    const items = await this.queryParticipantRecords(conversationId);
    return items.map((item) => item.userId);
  }

  private async queryParticipantRecords(conversationId: string): Promise<any[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `CONVERSATION#${conversationId}`,
        ':sk': 'PARTICIPANT#',
      },
    });

    const result = await this.dynamoDBService.getDocClient().send(command);
    return result.Items || [];
  }

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `CONVERSATION#${conversationId}`,
        SK: `PARTICIPANT#${userId}`,
      },
    });

    const result = await this.dynamoDBService.getDocClient().send(command);
    return !!result.Item;
  }

  async updateLastMessageAt(conversationId: string, timestamp: Date | string): Promise<void> {
    const isoTimestamp = timestamp instanceof Date ? timestamp.toISOString() : timestamp;

    await this.dynamoDBService.getDocClient().send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: `CONVERSATION#${conversationId}`,
          SK: 'METADATA',
        },
        UpdateExpression: 'SET lastMessageAt = :timestamp, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':timestamp': isoTimestamp,
          ':updatedAt': new Date().toISOString(),
        },
      }),
    );
  }

  private deserializeConversation(item: any): Conversation {
    return {
      id: item.id,
      type: item.type as ConversationType,
      name: item.name,
      description: item.description,
      avatarUrl: item.avatarUrl,
      createdBy: item.createdBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lastMessageAt: item.lastMessageAt || null,
      participants: []
    };
  }
}
