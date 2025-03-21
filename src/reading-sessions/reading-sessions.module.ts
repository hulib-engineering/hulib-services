import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingSessionsService } from './reading-sessions.service';
import { ReadingSessionsController } from './reading-sessions.controller';
import { CaslModule } from '@casl/casl.module';
import { Feedback, Message, ReadingSession } from './entities';
import { SchedulesEntity } from '../schedules/infrastructure/persistence/relational/entities/schedules.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { StoryEntity } from '../stories/infrastructure/persistence/relational/entities/story.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReadingSession,
      Feedback,
      Message,
      UserEntity,
      StoryEntity,
      SchedulesEntity,
    ]),
    CaslModule,
  ],
  controllers: [ReadingSessionsController],
  providers: [ReadingSessionsService],
  exports: [ReadingSessionsService],
})
export class ReadingSessionsModule {}
