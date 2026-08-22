import { Module } from '@nestjs/common';

import { StoriesModule } from '@stories/stories.module';

import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [StoriesModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
