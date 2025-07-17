import { Module } from '@nestjs/common';

import { UsersModule } from '@users/users.module';

import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { RelationalChatPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalChatPersistenceModule, UsersModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService, RelationalChatPersistenceModule],
})
export class ChatModule {}
