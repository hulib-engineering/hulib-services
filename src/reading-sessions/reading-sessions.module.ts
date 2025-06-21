import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from '@casl/casl.module';

// Controllers
import { ReadingSessionsController } from './reading-sessions.controller';

// Services
import { ReadingSessionsService } from './reading-sessions.service';

// Repositories
import { ReadingSessionRepository } from './infrastructure/persistence/relational/repositories/reading-sessions.repository';
import { FeedbackRepository } from './infrastructure/persistence/relational/repositories/feedbacks.repository';
import { MessageRepository } from './infrastructure/persistence/relational/repositories/messages.repository';

// Entities
import { ReadingSessionEntity } from '@reading-sessions/infrastructure/persistence/relational/entities';
import { FeedbackEntity } from './infrastructure/persistence/relational/entities/feedback.entity';
import { MessageEntity } from './infrastructure/persistence/relational/entities/message.entity';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { StoryEntity } from '@stories/infrastructure/persistence/relational/entities/story.entity';
import { SchedulesEntity } from '@schedules/infrastructure/persistence/relational/entities/schedules.entity';

// Mappers
import { ReadingSessionMapper } from './infrastructure/persistence/relational/mappers/reading-sessions.mapper';
import { FeedbackMapper } from './infrastructure/persistence/relational/mappers/feedbacks.mapper';
import { MessageMapper } from './infrastructure/persistence/relational/mappers/messages.mapper';
import { UsersModule } from '@users/users.module';
import { StoriesModule } from '@stories/stories.module';
import { WebRtcModule } from '../web-rtc/web-rtc.module';
import { StoryReviewsModule } from '@story-reviews/story-reviews.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BullModule } from '@nestjs/bull';
import { MailModule } from '@mail/mail.module';
import { ReadingSessionsProcessor } from '@reading-sessions/reading-sessions.processor';

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
    CaslModule,
    UsersModule,
    StoriesModule,
    StoryReviewsModule,
    WebRtcModule,
    NotificationsModule,
    BullModule.registerQueue({
      name: 'reminder',
    }),
    MailModule,
  ],
  controllers: [ReadingSessionsController],
  providers: [
    ReadingSessionsService,
    ReadingSessionRepository,
    FeedbackRepository,
    MessageRepository,
    ReadingSessionMapper,
    FeedbackMapper,
    MessageMapper,
    ReadingSessionsProcessor,
  ],
  exports: [
    ReadingSessionsService,
    ReadingSessionRepository,
    FeedbackRepository,
    MessageRepository,
  ],
})
export class ReadingSessionsModule {}
