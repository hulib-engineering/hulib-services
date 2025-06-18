import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { User } from '@users/domain/user';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Chat } from './domain/chat';
import { AuthGuard } from '@nestjs/passport';
import { Conversation } from './domain/conversation';

@ApiTags('Chat')
// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'chat',
  version: '1',
})
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiCreatedResponse({
    type: Chat,
  })
  create(
    @Body() createChatDto: CreateChatDto,
    @Request() request: any,
  ) {
    return this.chatService.create(createChatDto, request.user.id);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all conversations' })
  @ApiOkResponse({
    type: Conversation,
    isArray: true,
  })
  async findAllConversations(@Request() request: any): Promise<Conversation[]> {
    return this.chatService.findAllConversations(request.user.id);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get chat with user' })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: Chat,
    isArray: true,
  })
  async findAllChat(
    @Request() request: any,
    @Param('id') id: User['id']
  ): Promise<Chat[]> {
    return this.chatService.findAllChats(request.user.id, id);
  }
}
