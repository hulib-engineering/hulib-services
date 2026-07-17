import { Module } from '@nestjs/common';
import { StoryReviewsService } from './story-reviews.service';
import { StoryReviewsController } from './story-reviews.controller';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [StoryReviewsController],
  providers: [StoryReviewsService],
  exports: [StoryReviewsService],
})
export class StoryReviewsModule {}
