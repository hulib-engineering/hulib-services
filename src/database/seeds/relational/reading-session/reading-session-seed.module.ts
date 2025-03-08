import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReadingSessionSeedService } from './reading-session-seed.service';
import { ReadingSession } from '@reading-sessions/entities/reading-session.entity';
import { ReadingSessionParticipant } from '@reading-sessions/entities/reading-session-participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReadingSession, ReadingSessionParticipant]),
  ],
  providers: [ReadingSessionSeedService],
  exports: [ReadingSessionSeedService],
})
export class ReadingSessionSeedModule {}
