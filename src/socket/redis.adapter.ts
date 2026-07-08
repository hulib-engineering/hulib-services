import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Logger } from '@nestjs/common';
import 'dotenv/config';
import { Redis } from 'ioredis';
import { ServerOptions } from 'socket.io';
import { getConfig as getRedisConfig } from '../cache/config/cache.config';

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    this.connectRedisAdapter(server);
    return server;
  }

  private connectRedisAdapter(server: ReturnType<IoAdapter['createIOServer']>) {
    const redisConfig = {
      ...getRedisConfig(),
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    };

    const pubClient = new Redis(redisConfig);
    const subClient = pubClient.duplicate();

    const handleRedisError = (error: Error) => {
      this.logger.warn(
        `Redis socket adapter error: ${error.message}.`,
      );
    };

    pubClient.on('error', handleRedisError);
    subClient.on('error', handleRedisError);

    Promise.all([pubClient.connect(), subClient.connect()])
      .then(() => {
        server.adapter(createAdapter(pubClient, subClient));
        this.logger.log('Redis socket adapter connected.');
      })
      .catch(() => {
        pubClient.disconnect();
        subClient.disconnect();
      });
  }
}
