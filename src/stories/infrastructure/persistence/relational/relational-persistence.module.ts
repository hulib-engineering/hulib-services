import { Module } from '@nestjs/common';
import { StoryRepository } from '../story.repository';
import { StoriesRelationalRepository } from './repositories/story.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoryEntity } from './entities/story.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoryEntity])],
  providers: [
    {
      provide: StoryRepository,
      useClass: StoriesRelationalRepository,
    },
  ],
  exports: [StoryRepository],
})
export class RelationalStoriesPersistenceModule {}
