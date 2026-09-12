import { Module } from '@nestjs/common';
import { StoryRepository } from '../story.repository';
import { PrismaStoriesRepository } from '../prisma/repositories/story-prisma.repository';
import { UserRepository } from '../../../../users/infrastructure/persistence/user.repository';
import { UserRepositoryImplement } from '../../../../users/infrastructure/persistence/relational/repositories/user-prisma.repository';
import { TopicsRepository } from '../../../../topics/infrastructure/persistence/topics.repository';
import { TopicsRepositoryImplement } from '../../../../topics/infrastructure/persistence/relational/repositories/topics-prisma.repository';
@Module({
  providers: [
    {
      provide: StoryRepository,
      useClass: PrismaStoriesRepository,
    },
    {
      provide: UserRepository,
      useClass: UserRepositoryImplement,
    },
    {
      provide: TopicsRepository,
      useClass: TopicsRepositoryImplement,
    },
  ],
  exports: [StoryRepository, UserRepository, TopicsRepository],
})
export class RelationalStoriesPersistenceModule {}
