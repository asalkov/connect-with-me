import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
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

const docClient = DynamoDBDocumentClient.from(client);

const usersTableName = process.env.DYNAMODB_USERS_TABLE || 'chat-users-dev';
const messagesTableName = process.env.DYNAMODB_MESSAGES_TABLE || 'chat-messages-dev';
const conversationsTableName = process.env.DYNAMODB_CONVERSATIONS_TABLE || 'chat-conversations-dev';

async function seedData() {
  console.log('🌱 Seeding test data...\n');
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`🌍 Region: ${region}\n`);

  try {
    // Create test users
    const userId1 = uuidv4();
    const userId2 = uuidv4();
    const userId3 = uuidv4();

    const users = [
      {
        PK: `USER#${userId1}`,
        SK: 'PROFILE',
        id: userId1,
        email: 'alice@example.com',
        username: 'alice',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Alice',
        lastName: 'Smith',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        PK: `USER#${userId2}`,
        SK: 'PROFILE',
        id: userId2,
        email: 'bob@example.com',
        username: 'bob',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Bob',
        lastName: 'Jones',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        PK: `USER#${userId3}`,
        SK: 'PROFILE',
        id: userId3,
        email: 'charlie@example.com',
        username: 'charlie',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Charlie',
        lastName: 'Brown',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const user of users) {
      await docClient.send(
        new PutCommand({
          TableName: usersTableName,
          Item: user,
        })
      );
      console.log(`✅ Created user: ${user.username} (${user.email})`);
    }

    // Create a test conversation
    const conversationId = uuidv4();
    const now = new Date().toISOString();

    // Conversation metadata
    const conversationMetadata = {
      PK: `CONV#${conversationId}`,
      SK: 'METADATA',
      id: conversationId,
      type: 'direct',
      participants: [userId1, userId2],
      lastMessage: 'Hey Bob, how are you?',
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: conversationsTableName,
        Item: conversationMetadata,
      })
    );
    console.log(`✅ Created conversation: ${conversationId}`);

    // Conversation participants (for querying user's conversations)
    for (const userId of [userId1, userId2]) {
      await docClient.send(
        new PutCommand({
          TableName: conversationsTableName,
          Item: {
            PK: `CONV#${conversationId}`,
            SK: `USER#${userId}`,
            GSI1PK: `USER#${userId}`,
            GSI1SK: `CONV#${now}`,
            conversationId,
            userId,
            lastReadAt: now,
          },
        })
      );
    }

    // Create test messages
    const messages = [
      {
        id: uuidv4(),
        content: 'Hey Bob, how are you?',
        senderId: userId1,
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      {
        id: uuidv4(),
        content: "Hi Alice! I'm doing great, thanks for asking!",
        senderId: userId2,
        timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
      },
      {
        id: uuidv4(),
        content: 'Want to grab coffee later?',
        senderId: userId1,
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      },
      {
        id: uuidv4(),
        content: 'Sure! How about 3pm?',
        senderId: userId2,
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      },
    ];

    for (const message of messages) {
      await docClient.send(
        new PutCommand({
          TableName: messagesTableName,
          Item: {
            PK: `CONV#${conversationId}`,
            SK: `MSG#${message.timestamp}#${message.id}`,
            GSI1PK: `USER#${message.senderId}`,
            GSI1SK: `MSG#${message.timestamp}`,
            id: message.id,
            conversationId,
            senderId: message.senderId,
            content: message.content,
            createdAt: message.timestamp,
            updatedAt: message.timestamp,
          },
        })
      );
      console.log(`✅ Created message from ${message.senderId.slice(0, 8)}...`);
    }

    console.log('\n✅ Seeding complete!');
    console.log('\n📊 Test Data Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Conversations: 1`);
    console.log(`   - Messages: ${messages.length}`);
    console.log('\n🔐 Test Credentials:');
    console.log('   - alice@example.com / password123');
    console.log('   - bob@example.com / password123');
    console.log('   - charlie@example.com / password123');
    console.log('\n📊 View data at: http://localhost:8001');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
