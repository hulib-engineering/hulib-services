import { Module } from '@nestjs/common';

import { UsersModule } from '@users/users.module';

import { ChatRepository } from './chat.repository';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [UsersModule, SocketModule],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository],
  exports: [ChatService, ChatRepository],
})
export class ChatModule {}
