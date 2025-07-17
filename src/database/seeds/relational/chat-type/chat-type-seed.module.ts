import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatTypeSeedService } from './chat-type-seed.service';
import { ChatTypeEntity } from '@chat-types/infrastructure/persistence/relational/entities/chat-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatTypeEntity])],
  providers: [ChatTypeSeedService],
  exports: [ChatTypeSeedService],
})
export class ChatTypeSeedModule {}
