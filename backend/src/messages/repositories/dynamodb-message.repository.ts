import { Injectable } from '@nestjs/common';
import {
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBService } from '../../database/dynamodb';
import { BaseDynamoDBRepository } from '../../database/dynamodb/base-dynamodb.repository';
import { Message, MessageType, MessageStatus } from '../types/message.types';
import {
  IMessageRepository,
  CreateMessageData,
  UpdateMessageData,
  FindMessagesParams,
  FindMessagesResult,
} from './message.repository.interface';

@Injectable()
export class DynamoDBMessageRepository extends BaseDynamoDBRepository<Message> implements IMessageRepository {
  constructor(dynamoDBService: DynamoDBService) {
    super(dynamoDBService, 'messages');
  }

  async create(messageData: CreateMessageData): Promise<Message> {
    const now = new Date().toISOString();
    const message: Message = {
      id: uuidv4(),
      content: messageData.content,
      type: (messageData.type as MessageType) || MessageType.TEXT,
      status: MessageStatus.SENT,
      senderId: messageData.senderId,
      conversationId: messageData.conversationId,
      isEdited: false,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        PK: `CONVERSATION#${message.conversationId}`,
        SK: `MESSAGE#${now}#${message.id}`,
        GSI1PK: `MESSAGE#${message.id}`,
        GSI1SK: 'METADATA',
        id: message.id,
        content: message.content,
        type: message.type || MessageType.TEXT,
        status: message.status || MessageStatus.SENT,
        senderId: message.senderId,
        conversationId: message.conversationId,
        isEdited: false,
        isDeleted: false,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
        entityType: 'MESSAGE',
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    });

    await this.dynamoDBService.getDocClient().send(command);
    return message;
  }

  async findById(id: string): Promise<Message | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `MESSAGE#${id}`,
        ':sk': 'METADATA',
      },
      Limit: 1,
    });

    const result = await this.dynamoDBService.getDocClient().send(command);
    
    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    return this.deserializeMessage(result.Items[0]);
  }

  async findByConversationId(params: FindMessagesParams): Promise<FindMessagesResult> {
    const { conversationId, limit = 50, cursor, beforeTimestamp } = params;

    const keyConditionExpression = beforeTimestamp
      ? 'PK = :pk AND SK < :beforeSK'
      : 'PK = :pk AND begins_with(SK, :sk)';

    const expressionAttributeValues: Record<string, any> = {
      ':pk': `CONVERSATION#${conversationId}`,
    };

    if (beforeTimestamp) {
      expressionAttributeValues[':beforeSK'] = `MESSAGE#${beforeTimestamp}`;
    } else {
      expressionAttributeValues[':sk'] = 'MESSAGE#';
    }

    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ScanIndexForward: false, // Most recent first
      Limit: limit,
      ExclusiveStartKey: cursor ? JSON.parse(cursor) : undefined,
    });

    const result = await this.dynamoDBService.getDocClient().send(command);

    const messages = (result.Items || []).map((item) => this.deserializeMessage(item));

    return {
      messages,
      nextCursor: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : undefined,
    };
  }

  async update(id: string, messageData: UpdateMessageData): Promise<Message> {
    // First, find the message to get its PK and SK
    const existingMessage = await this.findById(id);
    if (!existingMessage) {
      throw new Error(`Message with ID ${id} not found`);
    }

    const key = {
      PK: `CONVERSATION#${existingMessage.conversationId}`,
      SK: `MESSAGE#${existingMessage.createdAt}#${existingMessage.id}`,
    };

    const result = await this.executeUpdate(key, messageData);
    return this.deserializeMessage(result);
  }

  async delete(id: string): Promise<void> {
    // Soft delete by marking as deleted
    await this.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    await this.update(messageId, {
      status: MessageStatus.READ,
    });
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    // Get all unread messages in the conversation
    const result = await this.findByConversationId({
      conversationId,
      limit: 100,
    });

    // Update all messages to READ status
    const updatePromises = result.messages
      .filter((msg) => msg.status !== MessageStatus.READ && msg.senderId !== userId)
      .map((msg) => this.markAsRead(msg.id, userId));

    await Promise.all(updatePromises);
  }

  private deserializeMessage(item: any): Message {
    return {
      id: item.id,
      content: item.content,
      type: item.type as MessageType,
      status: item.status as MessageStatus,
      senderId: item.senderId,
      conversationId: item.conversationId,
      isEdited: item.isEdited,
      isDeleted: item.isDeleted,
      deletedAt: item.deletedAt || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
