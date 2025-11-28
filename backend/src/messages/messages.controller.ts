import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get(':conversationId')
  async getMessages(
    @Req() req,
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
    @Req() req,
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
      senderId: req.user.id,
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
    @Req() req,
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
  async deleteMessage(@Req() req, @Param('id') id: string) {
    await this.messagesService.delete(id);
    return { message: 'Message deleted successfully' };
  }

  @Post(':id/read')
  async markAsRead(@Req() req, @Param('id') id: string) {
    await this.messagesService.markAsRead(id, req.user.id);
    return { message: 'Message marked as read' };
  }

  @Post(':conversationId/read-all')
  async markConversationAsRead(
    @Req() req,
    @Param('conversationId') conversationId: string,
  ) {
    await this.messagesService.markConversationAsRead(
      conversationId,
      req.user.id,
    );
    return { message: 'All messages marked as read' };
  }
}
