import { Module } from '@nestjs/common';

import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { StoriesAdminController } from './stories-admin.controller';

import { UsersModule } from '@users/users.module';
import { TopicsModule } from '@topics/topics.module';
import { StoryRepository } from './story.repository';
import { StoryReviewsModule } from '@story-reviews/story-reviews.module';
import { StoryReviewsService } from '@story-reviews/story-reviews.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CacheModule } from '../cache/cache.module';
import { MailModule } from '@mail/mail.module';

@Module({
  imports: [
    UsersModule,
    TopicsModule,
    StoryReviewsModule,
    NotificationsModule,
    CacheModule,
    MailModule,
  ],
  controllers: [StoriesAdminController, StoriesController],
  providers: [StoriesService, StoryReviewsService, StoryRepository],
  exports: [StoriesService, StoryRepository],
})
export class StoriesModule {}
