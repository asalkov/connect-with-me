import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';
import { UsersService } from '../users/users.service';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let jwtService: JwtService;
  let messagesService: MessagesService;
  let conversationsService: ConversationsService;
  let usersService: UsersService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      return null;
    }),
  };

  const mockMessagesService = {
    create: jest.fn(),
    markAsRead: jest.fn(),
    markConversationAsRead: jest.fn(),
  };

  const mockConversationsService = {
    findById: jest.fn(),
    getParticipants: jest.fn(),
    updateLastMessageAt: jest.fn(),
  };

  const mockUsersService = {
    updateStatus: jest.fn(),
    updateLastSeen: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: ConversationsService, useValue: mockConversationsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    jwtService = module.get<JwtService>(JwtService);
    messagesService = module.get<MessagesService>(MessagesService);
    conversationsService = module.get<ConversationsService>(ConversationsService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should accept valid JWT token', async () => {
      const mockClient: any = {
        id: 'socket-123',
        handshake: {
          auth: { token: 'valid-token' },
          headers: {},
        },
        data: {},
        emit: jest.fn(),
        disconnect: jest.fn(),
      };

      const mockPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      await gateway.handleConnection(mockClient);

      expect(mockClient.disconnect).not.toHaveBeenCalled();
      expect(mockClient.data.userId).toBe('user-123');
      expect(mockUsersService.updateStatus).toHaveBeenCalled();
    });

    it('should reject invalid JWT token', async () => {
      const mockClient: any = {
        id: 'socket-123',
        handshake: {
          auth: { token: 'invalid-token' },
          headers: {},
        },
        disconnect: jest.fn(),
      };

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await gateway.handleConnection(mockClient);

      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should reject connection without token', async () => {
      const mockClient: any = {
        id: 'socket-123',
        handshake: {
          auth: {},
          headers: {},
        },
        disconnect: jest.fn(),
      };

      await gateway.handleConnection(mockClient);

      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleJoinConversation', () => {
    it('should allow user to join conversation they are part of', async () => {
      const mockClient: any = {
        id: 'socket-123',
        data: {
          userId: 'user-123',
          username: 'testuser',
        },
        join: jest.fn(),
      };

      const mockConversation = {
        id: 'conv-123',
        participants: [{ id: 'user-123' }, { id: 'user-456' }],
      };

      mockConversationsService.findById.mockResolvedValue(mockConversation);

      const result = await gateway.handleJoinConversation(mockClient, {
        conversationId: 'conv-123',
      });

      expect(result.success).toBe(true);
      expect(mockClient.join).toHaveBeenCalledWith('conversation:conv-123');
    });

    it('should reject joining conversation user is not part of', async () => {
      const mockClient: any = {
        id: 'socket-123',
        data: {
          userId: 'user-123',
          username: 'testuser',
        },
        join: jest.fn(),
      };

      mockConversationsService.findById.mockRejectedValue(new Error('Forbidden'));

      const result = await gateway.handleJoinConversation(mockClient, {
        conversationId: 'conv-123',
      });

      expect(result.error).toBeDefined();
      expect(mockClient.join).not.toHaveBeenCalled();
    });
  });

  describe('handleSendMessage', () => {
    it('should send message and broadcast to conversation', async () => {
      const mockClient: any = {
        id: 'socket-123',
        data: {
          userId: 'user-123',
          username: 'testuser',
        },
      };

      const mockMessage = {
        id: 'msg-123',
        conversationId: 'conv-123',
        senderId: 'user-123',
        content: 'Hello',
        type: 'text',
        createdAt: new Date().toISOString(),
      };

      mockConversationsService.findById.mockResolvedValue({ id: 'conv-123' });
      mockMessagesService.create.mockResolvedValue(mockMessage);
      mockConversationsService.getParticipants.mockResolvedValue(['user-123', 'user-456']);

      const result = await gateway.handleSendMessage(mockClient, {
        conversationId: 'conv-123',
        content: 'Hello',
        type: 'text',
      });

      expect(result.success).toBe(true);
      expect(mockMessagesService.create).toHaveBeenCalled();
      expect(mockConversationsService.updateLastMessageAt).toHaveBeenCalled();
    });
  });

  describe('handleMarkAsRead', () => {
    it('should mark messages as read', async () => {
      const mockClient: any = {
        id: 'socket-123',
        data: {
          userId: 'user-123',
          username: 'testuser',
        },
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };

      const result = await gateway.handleMarkAsRead(mockClient, {
        conversationId: 'conv-123',
        messageIds: ['msg-1', 'msg-2'],
      });

      expect(result.success).toBe(true);
      expect(mockMessagesService.markAsRead).toHaveBeenCalledTimes(2);
    });
  });

  describe('utility methods', () => {
    it('should check if user is online', () => {
      expect(gateway.isUserOnline('user-123')).toBe(false);
    });

    it('should get online users count', () => {
      expect(gateway.getOnlineUsersCount()).toBe(0);
    });
  });
});
