import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { RelationalStoriesPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

import { UsersModule } from '@users/users.module';
import { StoryReviewsModule } from '@story-reviews/story-reviews.module';
import { StoryReviewsService } from '@story-reviews/story-reviews.service';

@Module({
  imports: [
    RelationalStoriesPersistenceModule,
    UsersModule,
    StoryReviewsModule,
  ],
  controllers: [StoriesController],
  providers: [StoriesService, StoryReviewsService],
  exports: [StoriesService, RelationalStoriesPersistenceModule],
})
export class StoriesModule {}
