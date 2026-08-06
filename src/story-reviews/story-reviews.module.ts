import { Module } from '@nestjs/common';
import { StoryReviewsService } from './story-reviews.service';
import { StoryReviewsController } from './story-reviews.controller';
import { CacheModule } from '../cache/cache.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [CacheModule, NotificationsModule],
  controllers: [StoryReviewsController],
  providers: [StoryReviewsService],
  exports: [StoryReviewsService],
})
export class StoryReviewsModule {}
