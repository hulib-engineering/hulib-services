import { Module } from '@nestjs/common';

import { ChatService } from './chat.service';
import { TimeSlotController } from './chat.controller';
import { RelationalChatPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [RelationalChatPersistenceModule, UsersModule],
  controllers: [TimeSlotController],
  providers: [ChatService],
  exports: [ChatService, RelationalChatPersistenceModule],
})
export class ChatModule {}
