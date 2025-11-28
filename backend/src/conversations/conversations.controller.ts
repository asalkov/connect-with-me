import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationType } from './types/conversation.types';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(
    private conversationsService: ConversationsService,
    private usersService: UsersService,
  ) {}

  @Post()
  async createConversation(
    @Req() req,
    @Body() body: {
      type: ConversationType;
      participantIds: string[];
      name?: string;
      description?: string;
    },
  ) {
    const conversation = await this.conversationsService.createConversation(req.user.id, body);
    return { conversation };
  }

  @Get()
  async getConversations(@Req() req, @Query('limit') limit?: number) {
    const conversations = await this.conversationsService.findUserConversations(
      req.user.id,
      limit ? parseInt(String(limit)) : undefined,
    );

    // Enrich conversations with participant details
    const enrichedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const participantIds = await this.conversationsService.getParticipants(conversation.id, req.user.id);
        
        // Fetch user details for all participants
        const participants = await Promise.all(
          participantIds.map(async (participantId) => {
            try {
              const user = await this.usersService.findById(participantId);
              return {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatarUrl: user.avatarUrl,
                status: user.status,
              };
            } catch (error) {
              return null;
            }
          })
        );

        // For direct conversations, find the other user
        let otherUser = null;
        if (conversation.type === ConversationType.DIRECT) {
          const otherParticipant = participants.find(p => p && p.id !== req.user.id);
          otherUser = otherParticipant;
        }

        return {
          ...conversation,
          participants: participants.filter(p => p !== null),
          otherUser,
        };
      })
    );

    return { conversations: enrichedConversations };
  }

  @Get(':id')
  async getConversation(@Req() req, @Param('id') id: string) {
    const conversation = await this.conversationsService.findById(id, req.user.id);
    return { conversation };
  }

  @Put(':id')
  async updateConversation(
    @Req() req,
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      description?: string;
      avatarUrl?: string;
    },
  ) {
    const conversation = await this.conversationsService.updateConversation(id, req.user.id, body);
    return { conversation };
  }

  @Delete(':id')
  async deleteConversation(@Req() req, @Param('id') id: string) {
    await this.conversationsService.deleteConversation(id, req.user.id);
    return { message: 'Conversation deleted successfully' };
  }

  @Post(':id/participants')
  async addParticipant(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    await this.conversationsService.addParticipant(id, req.user.id, body.userId);
    return { message: 'Participant added successfully' };
  }

  @Delete(':id/participants/:userId')
  async removeParticipant(
    @Req() req,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    await this.conversationsService.removeParticipant(id, req.user.id, userId);
    return { message: 'Participant removed successfully' };
  }

  @Post(':id/leave')
  async leaveConversation(@Req() req, @Param('id') id: string) {
    await this.conversationsService.leaveConversation(id, req.user.id);
    return { message: 'Left conversation successfully' };
  }

  @Get(':id/participants')
  async getParticipants(@Req() req, @Param('id') id: string) {
    const participants = await this.conversationsService.getParticipants(id, req.user.id);
    return { participants };
  }
}
