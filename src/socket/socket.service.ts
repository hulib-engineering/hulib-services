import { Injectable } from '@nestjs/common';

import { CacheService } from '../cache/cache.service';
import { SocketGateway } from './socket.gateway';
import ms from 'ms';
import { User } from '@users/domain/user';

@Injectable()
export class SocketService {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly cacheService: CacheService,
  ) {}

  async sendTo(userId: string, event: string, data?: any) {
    const userClients = await this.cacheService.get<string[]>({
      key: 'UserSocketClients',
      args: [userId],
    });
    if (userClients && Array.isArray(userClients)) {
      for (const clientId of userClients) {
        const client = this.socketGateway.getClient(clientId);
        if (client) {
          client.send(
            JSON.stringify({
              event,
              data,
            }),
          );
        }
      }
    }
  }

  sendToAll(event: string, data: any) {
    const allClients = this.socketGateway.getAllClients();
    for (const client of allClients.values()) {
      client.send(
        JSON.stringify({
          event,
          data,
        }),
      );
    }
  }

  async markUserOnline(userId: string) {
    await this.cacheService.set(
      { key: 'UserOnlineStatus', args: [userId] },
      true,
      { ttl: ms('10m') }, // Adjust TTL as needed
    );
  }

  async getOnlineStatus(
    userIds: User['id'][],
  ): Promise<Record<number, boolean>> {
    const status: Record<number, boolean> = {};

    await Promise.all(
      userIds.map(async (id) => {
        const isOnline = await this.cacheService.get<boolean>({
          key: 'UserOnlineStatus',
          args: [id.toString()],
        });
        status[id] = !!isOnline;
      }),
    );

    return status;
  }

  async isUserOnline(userId: User['id']): Promise<boolean> {
    const userClients = await this.cacheService.get<string[]>({
      key: 'UserSocketClients',
      args: [String(userId)],
    });
    return !!(userClients && userClients.length > 0);
  }
}
