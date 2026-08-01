import { Module } from '@nestjs/common';

import { UsersModule } from '@users/users.module';

import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { RelationalChatPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { SocketModule } from '../socket/socket.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    RelationalChatPersistenceModule,
    UsersModule,
    SocketModule,
    NotificationsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService, RelationalChatPersistenceModule],
})
export class ChatModule {}
