import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';
import { UsersService } from '../users/users.service';
import { UserStatus } from '../types/user.types';

interface SocketData {
  userId: string;
  email: string;
  username: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://d3mdmjrv9mx88k.cloudfront.net',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  },
  namespace: '/',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  
  // Map of userId -> Set of socket IDs
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private messagesService: MessagesService,
    private conversationsService: ConversationsService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Client attempting to connect: ${client.id}`);

      // Extract and validate JWT token
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`No token provided for client: ${client.id}`);
        client.disconnect();
        return;
      }

      const user = await this.validateToken(token);
      
      if (!user) {
        this.logger.warn(`Invalid token for client: ${client.id}`);
        client.disconnect();
        return;
      }

      // Store user data in socket
      const socketData: SocketData = {
        userId: user.sub,
        email: user.email,
        username: user.username,
      };
      client.data = socketData;

      // Track user connections
      if (!this.userSockets.has(user.sub)) {
        this.userSockets.set(user.sub, new Set());
      }
      this.userSockets.get(user.sub).add(client.id);

      this.logger.log(`User ${user.username} (${user.sub}) connected: ${client.id}`);
      this.logger.log(`Total connections for user ${user.username}: ${this.userSockets.get(user.sub).size}`);

      // Update user status to online
      await this.usersService.updateStatus(user.sub, UserStatus.ONLINE);
      await this.usersService.updateLastSeen(user.sub);

      // Broadcast online status to all connected clients
      this.broadcastUserStatus(user.sub, UserStatus.ONLINE);

      // Send connection success to client
      client.emit('connected', {
        message: 'Successfully connected to chat server',
        userId: user.sub,
        socketId: client.id,
      });

    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const socketData = client.data as SocketData;
      
      if (!socketData?.userId) {
        this.logger.warn(`Client ${client.id} disconnected without user data`);
        return;
      }

      const userId = socketData.userId;
      
      // Remove socket from user's connections
      if (this.userSockets.has(userId)) {
        this.userSockets.get(userId).delete(client.id);
        
        // If no more connections for this user, mark as offline
        if (this.userSockets.get(userId).size === 0) {
          this.userSockets.delete(userId);
          
          await this.usersService.updateStatus(userId, UserStatus.OFFLINE);
          await this.usersService.updateLastSeen(userId);
          
          this.broadcastUserStatus(userId, UserStatus.OFFLINE);
          
          this.logger.log(`User ${socketData.username} (${userId}) went offline`);
        } else {
          this.logger.log(`User ${socketData.username} (${userId}) still has ${this.userSockets.get(userId).size} connection(s)`);
        }
      }

      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error(`Disconnect error for client ${client.id}:`, error);
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const socketData = client.data as SocketData;
      const { conversationId } = data;

      this.logger.log(`User ${socketData.username} joining conversation: ${conversationId}`);

      // Verify user is participant in the conversation
      const conversation = await this.conversationsService.findById(conversationId, socketData.userId);
      
      if (!conversation) {
        return { error: 'Conversation not found or access denied' };
      }

      // Join the conversation room
      await client.join(`conversation:${conversationId}`);
      
      this.logger.log(`User ${socketData.username} joined room: conversation:${conversationId}`);

      return { success: true, conversationId };
    } catch (error) {
      this.logger.error('Error joining conversation:', error);
      return { error: error.message || 'Failed to join conversation' };
    }
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const socketData = client.data as SocketData;
      const { conversationId } = data;

      this.logger.log(`User ${socketData.username} leaving conversation: ${conversationId}`);

      await client.leave(`conversation:${conversationId}`);
      
      return { success: true, conversationId };
    } catch (error) {
      this.logger.error('Error leaving conversation:', error);
      return { error: 'Failed to leave conversation' };
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      conversationId: string;
      content: string;
      type?: string;
    },
  ) {
    try {
      const socketData = client.data as SocketData;
      const { conversationId, content, type = 'text' } = data;

      this.logger.log(`User ${socketData.username} sending message to conversation: ${conversationId}`);

      // Verify user is participant
      await this.conversationsService.findById(conversationId, socketData.userId);

      // Create message
      const message = await this.messagesService.create({
        conversationId,
        senderId: socketData.userId,
        content,
        type,
      });

      this.logger.log(`Message created: ${message.id}`);

      // Update conversation last message timestamp
      await this.conversationsService.updateLastMessageAt(conversationId, new Date(message.createdAt));

      // Broadcast message to all users in the conversation room
      this.server.to(`conversation:${conversationId}`).emit('new_message', {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
        status: 'sent',
      });

      // Get conversation participants and notify about conversation update
      const participants = await this.conversationsService.getParticipants(conversationId, socketData.userId);
      
      participants.forEach(participantId => {
        this.emitToUser(participantId, 'conversation_updated', {
          conversationId,
          lastMessage: {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            createdAt: message.createdAt,
          },
          lastMessageAt: message.createdAt,
        });
      });

      return { success: true, message };
    } catch (error) {
      this.logger.error('Error sending message:', error);
      return { error: error.message || 'Failed to send message' };
    }
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const socketData = client.data as SocketData;
      const { conversationId } = data;

      this.logger.debug(`User ${socketData.username} started typing in: ${conversationId}`);

      // Broadcast to others in the conversation (not to sender)
      client.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId: socketData.userId,
        username: socketData.username,
        isTyping: true,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Error handling typing start:', error);
      return { error: 'Failed to broadcast typing indicator' };
    }
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const socketData = client.data as SocketData;
      const { conversationId } = data;

      this.logger.debug(`User ${socketData.username} stopped typing in: ${conversationId}`);

      client.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId: socketData.userId,
        username: socketData.username,
        isTyping: false,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Error handling typing stop:', error);
      return { error: 'Failed to broadcast typing indicator' };
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; messageIds: string[] },
  ) {
    try {
      const socketData = client.data as SocketData;
      const { conversationId, messageIds } = data;

      this.logger.log(`User ${socketData.username} marking ${messageIds.length} messages as read`);

      // Mark messages as read
      for (const messageId of messageIds) {
        await this.messagesService.markAsRead(messageId, socketData.userId);
      }

      // Notify other participants about read receipts
      client.to(`conversation:${conversationId}`).emit('messages_read', {
        conversationId,
        messageIds,
        readBy: socketData.userId,
        username: socketData.username,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Error marking messages as read:', error);
      return { error: 'Failed to mark messages as read' };
    }
  }

  @SubscribeMessage('mark_conversation_as_read')
  async handleMarkConversationAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const socketData = client.data as SocketData;
      const { conversationId } = data;

      this.logger.log(`User ${socketData.username} marking conversation ${conversationId} as read`);

      await this.messagesService.markConversationAsRead(conversationId, socketData.userId);

      return { success: true };
    } catch (error) {
      this.logger.error('Error marking conversation as read:', error);
      return { error: 'Failed to mark conversation as read' };
    }
  }

  // Helper methods
  private emitToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets && sockets.size > 0) {
      sockets.forEach(socketId => {
        this.server.to(socketId).emit(event, data);
      });
      this.logger.debug(`Emitted ${event} to user ${userId} (${sockets.size} socket(s))`);
    }
  }

  private broadcastUserStatus(userId: string, status: UserStatus) {
    this.server.emit('user_status', {
      userId,
      status,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Broadcasted status ${status} for user ${userId}`);
  }

  private async validateToken(token: string): Promise<any> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, { secret });
      return payload;
    } catch (error) {
      this.logger.error('Token validation failed:', error.message);
      return null;
    }
  }

  // Public method to emit events from other services
  public emitToConversation(conversationId: string, event: string, data: any) {
    this.server.to(`conversation:${conversationId}`).emit(event, data);
  }

  // Get online users count
  public getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Check if user is online
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId).size > 0;
  }
}
