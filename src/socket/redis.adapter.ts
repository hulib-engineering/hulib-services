import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import 'dotenv/config';
import { Redis } from 'ioredis';
import { ServerOptions } from 'socket.io';
import { getConfig as getRedisConfig } from '../cache/config/cache.config';

const pubClient = new Redis(getRedisConfig());
const subClient = pubClient.duplicate();
const redisAdapter = createAdapter(pubClient, subClient);

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(redisAdapter);
    return server;
  }
}
