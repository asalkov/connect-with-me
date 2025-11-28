import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBService } from './dynamodb.service';

/**
 * Base repository class for DynamoDB operations
 * Implements common patterns to reduce code duplication
 */
export abstract class BaseDynamoDBRepository<T> {
  protected tableName: string;

  constructor(
    protected dynamoDBService: DynamoDBService,
    tableKey: 'users' | 'messages' | 'conversations',
  ) {
    this.tableName = this.dynamoDBService.getTableName(tableKey);
  }

  /**
   * Build DynamoDB update expression dynamically
   * Eliminates duplicate update logic across repositories
   */
  protected buildUpdateExpression(data: Record<string, any>): {
    updateExpression: string;
    expressionAttributeNames: Record<string, string>;
    expressionAttributeValues: Record<string, any>;
  } {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Build update expression dynamically
    Object.entries(data).forEach(([key, value]) => {
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

    return {
      updateExpression: `SET ${updateExpressions.join(', ')}`,
      expressionAttributeNames,
      expressionAttributeValues,
    };
  }

  /**
   * Remove DynamoDB internal keys from response
   */
  protected cleanDynamoDBKeys(item: any): any {
    const { PK, SK, GSI1PK, GSI1SK, entityType, ...cleanItem } = item;
    return cleanItem;
  }

  /**
   * Execute update with common error handling
   */
  protected async executeUpdate(
    key: Record<string, any>,
    data: Record<string, any>,
  ): Promise<any> {
    const { updateExpression, expressionAttributeNames, expressionAttributeValues } =
      this.buildUpdateExpression(data);

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    try {
      const result = await this.dynamoDBService.getDocClient().send(command);
      return this.cleanDynamoDBKeys(result.Attributes);
    } catch (error) {
      console.error(`❌ Error updating item in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Log successful operations
   */
  protected logSuccess(operation: string, id: string): void {
    console.log(`✅ ${operation} in ${this.tableName}: ${id}`);
  }

  /**
   * Log errors
   */
  protected logError(operation: string, error: any, context?: string): void {
    console.error(`❌ Error ${operation} in ${this.tableName}${context ? ` (${context})` : ''}:`, error);
  }
}
