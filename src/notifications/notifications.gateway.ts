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
import {
  NotificationEvent,
  NotificationListFetchEvent,
} from './notification.events';

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

  @OnEvent(NotificationEvent.ListFetch)
  async emitNotification(payload: NotificationListFetchEvent) {
    this.logger.log('[GATEWAY] Notification list fetch event received');

    try {
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
    } catch (error) {
      this.logger.error(
        `Failed to push notification list to user ${payload.userId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  getClient(clientId: string): Socket | undefined {
    return this.clients?.get(clientId);
  }
}
