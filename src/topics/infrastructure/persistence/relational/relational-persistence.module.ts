import { Module } from '@nestjs/common';
import { TopicsRepository } from '@topics/infrastructure/persistence/topics.repository';
import { TopicsRepositoryImplement } from './repositories/topics-prisma.repository';

@Module({
  providers: [
    {
      provide: TopicsRepository,
      useClass: TopicsRepositoryImplement,
    },
  ],
  exports: [TopicsRepository],
})
export class RelationalTopicsPersistenceModule {}
