import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReadingSessionSeedService } from './reading-session-seed.service';
import { ReadingSession } from '@reading-sessions/entities/reading-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReadingSession])],
  providers: [ReadingSessionSeedService],
  exports: [ReadingSessionSeedService],
})
export class ReadingSessionSeedModule {}
