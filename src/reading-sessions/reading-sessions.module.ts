import { Module } from '@nestjs/common';
import { CaslModule } from '@permission/casl.module';

// Controllers
import { ReadingSessionsController } from './reading-sessions.controller';

// Services
import { ReadingSessionsService } from './reading-sessions.service';

// Repositories
import { ReadingSessionRepository } from './infrastructure/persistence/relational/repositories/reading-session-prisma.repository';
import { MessageRepository } from './infrastructure/persistence/relational/repositories/message-prisma.repository';

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
    MessageRepository,
    ReadingSessionsProcessor,
  ],
  exports: [
    ReadingSessionsService,
    ReadingSessionRepository,
    MessageRepository,
  ],
})
export class ReadingSessionsModule {}
