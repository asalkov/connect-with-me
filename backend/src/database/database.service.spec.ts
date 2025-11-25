import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../entities/user.entity';
import { Conversation, ConversationType } from '../entities/conversation.entity';
import { Message, MessageType, MessageStatus } from '../entities/message.entity';

describe('Database Entities', () => {
  let module: TestingModule;
  let userRepository: Repository<User>;
  let conversationRepository: Repository<Conversation>;
  let messageRepository: Repository<Message>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Conversation, Message],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([User, Conversation, Message]),
      ],
    }).compile();

    userRepository = module.get('UserRepository');
    conversationRepository = module.get('ConversationRepository');
    messageRepository = module.get('MessageRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  describe('User Entity', () => {
    it('should create a user', async () => {
      const user = userRepository.create({
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        status: UserStatus.ONLINE,
      });

      const savedUser = await userRepository.save(user);

      expect(savedUser.id).toBeDefined();
      expect(savedUser.email).toBe('test@example.com');
      expect(savedUser.username).toBe('testuser');
      expect(savedUser.status).toBe(UserStatus.ONLINE);
      expect(savedUser.createdAt).toBeDefined();
    });

    it('should enforce unique email constraint', async () => {
      const user1 = userRepository.create({
        email: 'duplicate@example.com',
        username: 'user1',
        password: 'password',
      });

      await userRepository.save(user1);

      const user2 = userRepository.create({
        email: 'duplicate@example.com',
        username: 'user2',
        password: 'password',
      });

      await expect(userRepository.save(user2)).rejects.toThrow();
    });
  });

  describe('Conversation Entity', () => {
    it('should create a direct conversation', async () => {
      const user1 = await userRepository.save(
        userRepository.create({
          email: 'directconv1@example.com',
          username: 'directconv1',
          password: 'password',
        }),
      );

      const user2 = await userRepository.save(
        userRepository.create({
          email: 'directconv2@example.com',
          username: 'directconv2',
          password: 'password',
        }),
      );

      const conversation = conversationRepository.create({
        type: ConversationType.DIRECT,
        createdBy: user1.id,
        participants: [user1, user2],
      });

      const savedConversation = await conversationRepository.save(conversation);

      expect(savedConversation.id).toBeDefined();
      expect(savedConversation.type).toBe(ConversationType.DIRECT);
      expect(savedConversation.participants).toHaveLength(2);
    });

    it('should create a group conversation', async () => {
      const conversation = conversationRepository.create({
        type: ConversationType.GROUP,
        name: 'Test Group',
        description: 'A test group conversation',
      });

      const savedConversation = await conversationRepository.save(conversation);

      expect(savedConversation.id).toBeDefined();
      expect(savedConversation.type).toBe(ConversationType.GROUP);
      expect(savedConversation.name).toBe('Test Group');
    });
  });

  describe('Message Entity', () => {
    it('should create a text message', async () => {
      const user = await userRepository.save(
        userRepository.create({
          email: 'sender@example.com',
          username: 'sender',
          password: 'password',
        }),
      );

      const conversation = await conversationRepository.save(
        conversationRepository.create({
          type: ConversationType.DIRECT,
          createdBy: user.id,
        }),
      );

      const message = messageRepository.create({
        content: 'Hello, World!',
        type: MessageType.TEXT,
        status: MessageStatus.SENT,
        senderId: user.id,
        conversationId: conversation.id,
      });

      const savedMessage = await messageRepository.save(message);

      expect(savedMessage.id).toBeDefined();
      expect(savedMessage.content).toBe('Hello, World!');
      expect(savedMessage.type).toBe(MessageType.TEXT);
      expect(savedMessage.status).toBe(MessageStatus.SENT);
      expect(savedMessage.createdAt).toBeDefined();
    });

    it('should support file messages', async () => {
      const user = await userRepository.save(
        userRepository.create({
          email: 'fileuser@example.com',
          username: 'fileuser',
          password: 'password',
        }),
      );

      const conversation = await conversationRepository.save(
        conversationRepository.create({
          type: ConversationType.DIRECT,
          createdBy: user.id,
        }),
      );

      const message = messageRepository.create({
        content: 'Check out this file',
        type: MessageType.FILE,
        status: MessageStatus.SENT,
        senderId: user.id,
        conversationId: conversation.id,
        fileUrl: 'https://example.com/file.pdf',
        fileName: 'document.pdf',
        fileSize: 1024000,
        fileMimeType: 'application/pdf',
      });

      const savedMessage = await messageRepository.save(message);

      expect(savedMessage.type).toBe(MessageType.FILE);
      expect(savedMessage.fileUrl).toBe('https://example.com/file.pdf');
      expect(savedMessage.fileName).toBe('document.pdf');
      expect(savedMessage.fileSize).toBe(1024000);
    });
  });

  describe('Relationships', () => {
    it('should load user with messages', async () => {
      const user = await userRepository.save(
        userRepository.create({
          email: 'reluser@example.com',
          username: 'reluser',
          password: 'password',
        }),
      );

      const conversation = await conversationRepository.save(
        conversationRepository.create({
          type: ConversationType.DIRECT,
          createdBy: user.id,
        }),
      );

      await messageRepository.save(
        messageRepository.create({
          content: 'Message 1',
          type: MessageType.TEXT,
          status: MessageStatus.SENT,
          senderId: user.id,
          conversationId: conversation.id,
        }),
      );

      const userWithMessages = await userRepository.findOne({
        where: { id: user.id },
        relations: ['messages'],
      });

      expect(userWithMessages.messages).toBeDefined();
      expect(userWithMessages.messages.length).toBeGreaterThan(0);
    });

    it('should load conversation with participants and messages', async () => {
      const user1 = await userRepository.save(
        userRepository.create({
          email: 'convrel1@example.com',
          username: 'convrel1',
          password: 'password',
        }),
      );

      const user2 = await userRepository.save(
        userRepository.create({
          email: 'convrel2@example.com',
          username: 'convrel2',
          password: 'password',
        }),
      );

      const conversation = await conversationRepository.save(
        conversationRepository.create({
          type: ConversationType.DIRECT,
          createdBy: user1.id,
          participants: [user1, user2],
        }),
      );

      await messageRepository.save(
        messageRepository.create({
          content: 'Test message',
          type: MessageType.TEXT,
          status: MessageStatus.SENT,
          senderId: user1.id,
          conversationId: conversation.id,
        }),
      );

      const conversationWithRelations = await conversationRepository.findOne({
        where: { id: conversation.id },
        relations: ['participants', 'messages'],
      });

      expect(conversationWithRelations.participants).toHaveLength(2);
      expect(conversationWithRelations.messages).toHaveLength(1);
    });
  });
});
