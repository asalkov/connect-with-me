import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../../entities/user.entity';
import { Conversation, ConversationType } from '../../entities/conversation.entity';
import { Message, MessageType, MessageStatus } from '../../entities/message.entity';
import dataSource from '../../config/typeorm.config';

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const userRepository = dataSource.getRepository(User);
    const conversationRepository = dataSource.getRepository(Conversation);
    const messageRepository = dataSource.getRepository(Message);

    // Clear existing data
    await messageRepository.delete({});
    await conversationRepository.delete({});
    await userRepository.delete({});

    console.log('Creating seed users...');

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = userRepository.create({
      email: 'john@example.com',
      username: 'john_doe',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Software developer and tech enthusiast',
      status: UserStatus.ONLINE,
      isActive: true,
    });

    const user2 = userRepository.create({
      email: 'jane@example.com',
      username: 'jane_smith',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      bio: 'Designer and creative thinker',
      status: UserStatus.ONLINE,
      isActive: true,
    });

    const user3 = userRepository.create({
      email: 'bob@example.com',
      username: 'bob_wilson',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Wilson',
      bio: 'Product manager',
      status: UserStatus.OFFLINE,
      isActive: true,
    });

    await userRepository.save([user1, user2, user3]);
    console.log('✓ Users created');

    // Create a direct conversation
    const directConversation = conversationRepository.create({
      type: ConversationType.DIRECT,
      createdBy: user1.id,
      participants: [user1, user2],
      isActive: true,
    });

    // Create a group conversation
    const groupConversation = conversationRepository.create({
      type: ConversationType.GROUP,
      name: 'Project Team',
      description: 'Discussion about the new project',
      createdBy: user1.id,
      participants: [user1, user2, user3],
      isActive: true,
    });

    await conversationRepository.save([directConversation, groupConversation]);
    console.log('✓ Conversations created');

    // Create sample messages
    const message1 = messageRepository.create({
      content: 'Hey Jane, how are you?',
      type: MessageType.TEXT,
      status: MessageStatus.READ,
      senderId: user1.id,
      conversationId: directConversation.id,
      sender: user1,
      conversation: directConversation,
    });

    const message2 = messageRepository.create({
      content: "Hi John! I'm doing great, thanks for asking!",
      type: MessageType.TEXT,
      status: MessageStatus.READ,
      senderId: user2.id,
      conversationId: directConversation.id,
      sender: user2,
      conversation: directConversation,
    });

    const message3 = messageRepository.create({
      content: 'Welcome to the project team!',
      type: MessageType.TEXT,
      status: MessageStatus.DELIVERED,
      senderId: user1.id,
      conversationId: groupConversation.id,
      sender: user1,
      conversation: groupConversation,
    });

    await messageRepository.save([message1, message2, message3]);
    console.log('✓ Messages created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Email: john@example.com | Password: password123');
    console.log('Email: jane@example.com | Password: password123');
    console.log('Email: bob@example.com | Password: password123');

    await dataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
