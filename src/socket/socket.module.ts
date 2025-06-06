import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { CacheModule } from '../cache/cache.module';
import { SocketGateway } from './socket.gateway';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [CacheModule],
  providers: [SocketGateway, ConfigService, SocketService],
  exports: [SocketService],
})
export class SocketModule {}
