import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  CreateTableCommand,
  CreateTableCommandInput,
  ListTablesCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  KeyType,
  ScalarAttributeType,
  ProjectionType,
  BillingMode,
} from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';
const region = process.env.AWS_REGION || 'us-east-1';

const client = new DynamoDBClient({
  region,
  endpoint,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
  },
});

async function tableExists(tableName: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function setupTables() {
  console.log('🚀 Setting up DynamoDB Local tables...\n');
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`🌍 Region: ${region}\n`);

  const usersTableName = process.env.DYNAMODB_USERS_TABLE || 'chat-users-dev';
  const messagesTableName = process.env.DYNAMODB_MESSAGES_TABLE || 'chat-messages-dev';
  const conversationsTableName = process.env.DYNAMODB_CONVERSATIONS_TABLE || 'chat-conversations-dev';

  // Users Table
  const usersTable: CreateTableCommandInput = {
    TableName: usersTableName,
    KeySchema: [
      { AttributeName: 'PK', KeyType: KeyType.HASH },  // USER#<userId>
      { AttributeName: 'SK', KeyType: KeyType.RANGE }, // PROFILE
    ],
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'SK', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'email', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'username', AttributeType: ScalarAttributeType.S },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [{ AttributeName: 'email', KeyType: KeyType.HASH }],
        Projection: { ProjectionType: ProjectionType.ALL },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: 'UsernameIndex',
        KeySchema: [{ AttributeName: 'username', KeyType: KeyType.HASH }],
        Projection: { ProjectionType: ProjectionType.ALL },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    BillingMode: BillingMode.PROVISIONED,
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  // Messages Table
  const messagesTable: CreateTableCommandInput = {
    TableName: messagesTableName,
    KeySchema: [
      { AttributeName: 'PK', KeyType: KeyType.HASH },  // CONV#<conversationId>
      { AttributeName: 'SK', KeyType: KeyType.RANGE }, // MSG#<timestamp>#<messageId>
    ],
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'SK', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'GSI1PK', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'GSI1SK', AttributeType: ScalarAttributeType.S },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserMessagesIndex',
        KeySchema: [
          { AttributeName: 'GSI1PK', KeyType: KeyType.HASH },  // USER#<userId>
          { AttributeName: 'GSI1SK', KeyType: KeyType.RANGE }, // MSG#<timestamp>
        ],
        Projection: { ProjectionType: ProjectionType.ALL },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    BillingMode: BillingMode.PROVISIONED,
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  // Conversations Table
  const conversationsTable: CreateTableCommandInput = {
    TableName: conversationsTableName,
    KeySchema: [
      { AttributeName: 'PK', KeyType: KeyType.HASH },  // CONV#<conversationId>
      { AttributeName: 'SK', KeyType: KeyType.RANGE }, // METADATA or USER#<userId>
    ],
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'SK', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'GSI1PK', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'GSI1SK', AttributeType: ScalarAttributeType.S },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserConversationsIndex',
        KeySchema: [
          { AttributeName: 'GSI1PK', KeyType: KeyType.HASH },  // USER#<userId>
          { AttributeName: 'GSI1SK', KeyType: KeyType.RANGE }, // CONV#<lastMessageAt>
        ],
        Projection: { ProjectionType: ProjectionType.ALL },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    BillingMode: BillingMode.PROVISIONED,
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  try {
    // Create tables
    for (const table of [usersTable, messagesTable, conversationsTable]) {
      const tableName = table.TableName!;
      const exists = await tableExists(tableName);
      
      if (exists) {
        console.log(`⚠️  Table already exists: ${tableName}`);
      } else {
        try {
          await client.send(new CreateTableCommand(table));
          console.log(`✅ Created table: ${tableName}`);
        } catch (error: any) {
          if (error.name === 'ResourceInUseException') {
            console.log(`⚠️  Table already exists: ${tableName}`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('\n✅ DynamoDB Local setup complete!');
    console.log('\n📊 Access DynamoDB Admin UI at: http://localhost:8001');
    console.log('🔍 Tables created:');
    console.log(`   - ${usersTableName}`);
    console.log(`   - ${messagesTableName}`);
    console.log(`   - ${conversationsTableName}`);
  } catch (error) {
    console.error('❌ Error setting up tables:', error);
    process.exit(1);
  }
}

setupTables();
