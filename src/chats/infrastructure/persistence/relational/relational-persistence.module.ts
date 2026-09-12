import { Module } from '@nestjs/common';

import { ChatRepository } from '../chat.repository';
import { ChatRepositoryImplement } from './repositories/chat-prisma.repository';

@Module({
  providers: [
    {
      provide: ChatRepository,
      useClass: ChatRepositoryImplement,
    },
  ],
  exports: [ChatRepository],
})
export class RelationalChatPersistenceModule {}
