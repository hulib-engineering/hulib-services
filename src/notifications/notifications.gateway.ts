import { WebSocketGateway, OnGatewayInit } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthService } from '@auth/auth.service';
import { CacheService } from '../cache/cache.service';
import {
  BaseSocketGateway,
  defaultCorsConfig,
} from '../socket/base-socket.gateway';
import { SocketService } from '../socket/socket.service';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({ namespace: '/notification', cors: defaultCorsConfig })
export class NotificationGateway
  extends BaseSocketGateway
  implements OnGatewayInit
{
  constructor(
    auth: AuthService,
    cache: CacheService,
    private readonly socketService: SocketService,
  ) {
    super(auth, cache);
  }

  afterInit() {
    this.setupAuthMiddleware();
    this.logger.log('Notification gateway initialized');
  }

  @OnEvent('notification.list.fetch')
  async emitNotification(payload: {
    userId: number;
    notifications: Notification[];
  }) {
    this.logger.log('[GATEWAY] Notification list fetch event received');

    const userClients = await this.cacheService.get<string[]>({
      key: 'UserSocketClients',
      args: [payload.userId.toString()],
    });

    if (userClients && Array.isArray(userClients)) {
      for (const clientId of userClients) {
        const client = this.getClient(clientId);
        if (client) {
          client.emit('list', payload.notifications);
        }
      }
    }
  }

  getClient(clientId: string): Socket | undefined {
    return this.clients?.get(clientId);
  }
}
