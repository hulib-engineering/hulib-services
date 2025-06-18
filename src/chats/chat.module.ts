import { Module } from '@nestjs/common';

import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { RelationalChatPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [RelationalChatPersistenceModule, UsersModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService, RelationalChatPersistenceModule],
})
export class ChatModule {}
