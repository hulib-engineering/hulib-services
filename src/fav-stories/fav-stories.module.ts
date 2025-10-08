import { Module } from '@nestjs/common';

import { FavStoriesController } from './fav-stories.controller';
import { FavStoriesService } from './fav-stories.service';

@Module({
  controllers: [FavStoriesController],
  providers: [FavStoriesService],
  exports: [FavStoriesService],
})
export class FavStoriesModule {}
