import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';

import { CacheModule } from '../cache/cache.module';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [CacheModule, AuthModule],
  providers: [SocketGateway, ConfigService, SocketService],
  exports: [SocketService],
})
export class SocketModule {}
