import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingSession } from './entities/reading-session.entity';
import { ReadingSessionParticipant } from './entities/reading-session-participant.entity';
import { ReadingSessionsService } from './reading-sessions.service';
import { ReadingSessionsController } from './reading-sessions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReadingSession, ReadingSessionParticipant]),
  ],
  controllers: [ReadingSessionsController],
  providers: [ReadingSessionsService],
  exports: [ReadingSessionsService],
})
export class ReadingSessionsModule {}
