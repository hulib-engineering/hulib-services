import {
  WebSocketGateway,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';

import { AuthService } from '@auth/auth.service';
import { CacheService } from '@cache/cache.service';
import { Chat } from '@chats/domain/chat';
import { ChatTypeEnum } from '@chat-types/chat-types.enum';

import {
  BaseSocketGateway,
  defaultCorsConfig,
  SocketWithSession,
} from '../socket/base-socket.gateway';

import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

interface ChatMessage {
  from: number;
  to: number;
  content: string;
  timestamp: number;
}

@Injectable()
@WebSocketGateway({ namespace: '/chat', cors: defaultCorsConfig })
export class ChatGateway extends BaseSocketGateway implements OnGatewayInit {
  constructor(
    auth: AuthService,
    cache: CacheService,
    private readonly chatService: ChatService,
  ) {
    super(auth, cache);
  }

  afterInit() {
    this.setupAuthMiddleware();
    this.logger.log('Chat gateway initialized');
  }

  @SubscribeMessage('send')
  async handleChatMessage(
    @MessageBody() message: CreateChatDto & { chatType: string },
    @ConnectedSocket() client: SocketWithSession,
  ) {
    const userId = client.session?.id as string;

    this.logger.log(`Message from ${userId} to ${message.recipientId}`);

    // Save to DB using service (not shown here)
    const newMsg = await this.chatService.create(
      {
        ...message,
        chatType: {
          id: message.chatType === 'img' ? ChatTypeEnum.img : ChatTypeEnum.txt,
        },
      },
      parseInt(userId),
    );

    const recipientSockets = await this.cacheService.get<string[]>({
      key: 'UserSocketClients',
      args: [message.recipientId.toString()],
    });

    if (recipientSockets) {
      for (const recipientId of recipientSockets) {
        const recipientClient = this.clients.get(recipientId);
        if (recipientClient) {
          const sanitizedMessage = {
            id: newMsg.id,
            from: newMsg.senderId,
            to: newMsg.recipientId,
            msg: newMsg.message,
            type: 'txt',
            time: newMsg.createdAt.getTime(),
          };
          recipientClient.emit('receive', sanitizedMessage);
        }
      }
    }
  }

  @SubscribeMessage('read')
  async markAsRead(
    @MessageBody() data: Pick<Chat, 'senderId'>,
    @ConnectedSocket() client: SocketWithSession,
  ) {
    const userId = client.session?.id;
    await this.chatService.markMessagesAsRead(data.senderId, Number(userId));

    const senderSockets = await this.cacheService.get<string[]>({
      key: 'UserSocketClients',
      args: [data.senderId.toString()],
    });
    if (senderSockets) {
      for (const socketId of senderSockets) {
        const senderSocket = this.clients.get(socketId);
        if (senderSocket) {
          senderSocket.emit('read');
        }
      }
    }
  }

  // (Optional) Trigger message from outside service
  @OnEvent('chat.send')
  async emitExternalMessage(payload: ChatMessage) {
    const userClients = await this.cacheService.get<string[]>({
      key: 'UserSocketClients',
      args: [payload.to.toString()],
    });

    if (userClients && Array.isArray(userClients)) {
      for (const clientId of userClients) {
        const targetSocket = this.clients.get(clientId);
        if (targetSocket) {
          targetSocket.emit('message', payload);
        }
      }
    }
  }
}
