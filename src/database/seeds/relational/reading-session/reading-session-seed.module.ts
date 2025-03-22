import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReadingSessionSeedService } from './reading-session-seed.service';

// Entities
import { ReadingSessionEntity } from '@reading-sessions/infrastructure/persistence/relational/entities/reading-session.entity';
import { FeedbackEntity } from '@reading-sessions/infrastructure/persistence/relational/entities/feedback.entity';
import { MessageEntity } from '@reading-sessions/infrastructure/persistence/relational/entities/message.entity';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { StoryEntity } from '@stories/infrastructure/persistence/relational/entities/story.entity';
import { SchedulesEntity } from '@schedules/infrastructure/persistence/relational/entities/schedules.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReadingSessionEntity,
      FeedbackEntity,
      MessageEntity,
      UserEntity,
      StoryEntity,
      SchedulesEntity,
    ]),
  ],
  providers: [ReadingSessionSeedService],
  exports: [ReadingSessionSeedService],
})
export class ReadingSessionSeedModule {}
