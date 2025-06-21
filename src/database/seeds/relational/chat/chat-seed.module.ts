import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatSeedService } from './chat-seed.service';
import { ChatEntity } from '../../../../chats/infrastructure/persistence/relational/entities/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatEntity])],
  providers: [ChatSeedService],
  exports: [ChatSeedService],
})
export class ChatSeedModule {}
