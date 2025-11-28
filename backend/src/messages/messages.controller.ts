import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../types/user.types';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get(':conversationId')
  async getMessages(
    @GetUser() user: User,
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    const result = await this.messagesService.findByConversationId({
      conversationId,
      limit: limit ? parseInt(limit.toString()) : undefined,
      cursor,
    });
    return result;
  }

  @Post()
  async sendMessage(
    @GetUser() user: User,
    @Body() body: {
      conversationId: string;
      content: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      fileMimeType?: string;
    },
  ) {
    const message = await this.messagesService.create({
      conversationId: body.conversationId,
      senderId: user.id,
      content: body.content,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSize: body.fileSize,
      fileMimeType: body.fileMimeType,
    });
    return { message };
  }

  @Put(':id')
  async updateMessage(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    const message = await this.messagesService.update(id, {
      content: body.content,
      isEdited: true,
    });
    return { message };
  }

  @Delete(':id')
  async deleteMessage(@GetUser() user: User, @Param('id') id: string) {
    await this.messagesService.delete(id);
    return { message: 'Message deleted successfully' };
  }

  @Post(':id/read')
  async markAsRead(@GetUser() user: User, @Param('id') id: string) {
    await this.messagesService.markAsRead(id, user.id);
    return { message: 'Message marked as read' };
  }

  @Post(':conversationId/read-all')
  async markConversationAsRead(
    @GetUser() user: User,
    @Param('conversationId') conversationId: string,
  ) {
    await this.messagesService.markConversationAsRead(
      conversationId,
      user.id,
    );
    return { message: 'All messages marked as read' };
  }
}
