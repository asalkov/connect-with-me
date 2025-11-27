import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationType } from '../entities/conversation.entity';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

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
    return { conversations };
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
