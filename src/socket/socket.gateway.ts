import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { AuthService } from '@auth/auth.service';
import { CacheService } from '@cache/cache.service';
import { CreateChatDto } from '@chats/dto/create-chat.dto';
import { ChatTypeEnum } from '@chat-types/chat-types.enum';

import {
  defaultCorsConfig,
  BaseSocketGateway,
  SocketWithSession,
} from './base-socket.gateway';
import { SocketGuard } from './socket.guard';

@WebSocketGateway({ namespace: '/', cors: defaultCorsConfig })
export class SocketGateway extends BaseSocketGateway {
  constructor(
    protected override readonly authService: AuthService,
    protected override readonly cacheService: CacheService,
  ) {
    super(authService, cacheService);
  }

  afterInit() {
    this.logger.log(`Websocket gateway initialized.`);
    this.setupAuthMiddleware();
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: SocketWithSession,
    @MessageBody() _message: any,
  ) {
    const socketSession = socket?.session;
    this.logger.log('Connect session', socketSession);
    console.log(
      `Received message from client: ${socket?.id}.`,
      JSON.stringify(_message, null, 2),
      // _user,
    );
    socket.send('hello world');
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() socket: SocketWithSession) {
    socket.send('pong');
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('reaction')
  async handleReaction(
    @MessageBody() data: { recipientId: string },
    @ConnectedSocket() client: SocketWithSession,
  ) {
    const senderId = client.session?.id;

    this.logger.log(`Reaction from ${senderId} to ${data.recipientId}`);

    // Get all connected sockets
    const recipientSockets = await this.cacheService.get<string[]>({
      key: 'UserSocketClients',
      args: [data.recipientId.toString()],
    });

    if (recipientSockets && Array.isArray(recipientSockets)) {
      for (const socketId of recipientSockets) {
        const targetSocket = this.clients.get(socketId);
        if (targetSocket) {
          targetSocket.emit('reaction');
        }
      }
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('chat-in-call:send')
  async handleMeetingMessage(
    @MessageBody() message: CreateChatDto,
    @ConnectedSocket() client: SocketWithSession,
  ) {
    const userId = client.session?.id as string;

    this.logger.log(
      `Message from ${userId} to ${message.recipientId} in Agora channel`,
    );

    const payload = {
      from: userId,
      to: message.recipientId,
      content: message.message,
      chatType: ChatTypeEnum[message.chatType?.id || 0],
      timestamp: new Date().toISOString(),
    };

    // broadcast to everyone in the same room
    const recipientSockets = await this.cacheService.get<string[]>({
      key: 'UserSocketClients',
      args: [message.recipientId.toString()],
    });

    if (recipientSockets && Array.isArray(recipientSockets)) {
      for (const recipientId of recipientSockets) {
        const recipientClient = this.clients.get(recipientId);
        if (recipientClient) {
          recipientClient.emit('chat-in-call:receive', payload);
        }
      }
    }
  }

  getClient(clientId: string): Socket | undefined {
    return this.clients?.get(clientId);
  }

  getAllClients() {
    return this.clients;
  }
}
