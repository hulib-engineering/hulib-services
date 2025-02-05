import { Module } from '@nestjs/common';
import { StoryReviewSeedService } from './story-review-seed.service';

@Module({
  providers: [StoryReviewSeedService],
  exports: [StoryReviewSeedService],
})
export class StoryReviewSeedModule {}
