import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { AuthService } from '@auth/auth.service';

import {
  defaultCorsConfig,
  BaseSocketGateway,
  SocketWithSession,
} from './base-socket.gateway';

import { CacheService } from '../cache/cache.service';
import { UseGuards } from '@nestjs/common';
import { SocketGuard } from './socket.guard';
import { Socket } from 'socket.io';

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
    console.log('Connect session', socketSession);
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

  getClient(clientId: string): Socket | undefined {
    return this.clients?.get(clientId);
  }

  getAllClients() {
    return this.clients;
  }
}
