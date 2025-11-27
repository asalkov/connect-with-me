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
import { Message, MessageType, MessageStatus } from '../../entities/message.entity';
import {
  IMessageRepository,
  CreateMessageData,
  UpdateMessageData,
  FindMessagesParams,
  FindMessagesResult,
} from './message.repository.interface';

@Injectable()
export class DynamoDBMessageRepository implements IMessageRepository {
  private tableName: string;

  constructor(private dynamoDBService: DynamoDBService) {
    this.tableName = this.dynamoDBService.getTableName('messages');
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
      fileUrl: messageData.fileUrl,
      fileName: messageData.fileName,
      fileSize: messageData.fileSize,
      fileMimeType: messageData.fileMimeType,
      metadata: messageData.metadata,
      isEdited: false,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date(now),
      updatedAt: new Date(now),
      sender: null,
      conversation: null,
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
        type: message.type,
        status: message.status,
        senderId: message.senderId,
        conversationId: message.conversationId,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        fileSize: message.fileSize,
        fileMimeType: message.fileMimeType,
        metadata: message.metadata,
        isEdited: message.isEdited,
        isDeleted: message.isDeleted,
        deletedAt: message.deletedAt,
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

    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Build update expression dynamically
    Object.entries(messageData).forEach(([key, value]) => {
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
        PK: `CONVERSATION#${existingMessage.conversationId}`,
        SK: `MESSAGE#${existingMessage.createdAt.toISOString()}#${existingMessage.id}`,
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await this.dynamoDBService.getDocClient().send(command);
    return this.deserializeMessage(result.Attributes);
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
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      fileSize: item.fileSize,
      fileMimeType: item.fileMimeType,
      metadata: item.metadata,
      isEdited: item.isEdited,
      isDeleted: item.isDeleted,
      deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      sender: null,
      conversation: null,
    };
  }
}
