import { Module } from '@nestjs/common';
import { TopicsRepository } from '@topics/infrastructure/persistence/topics.repository';
import { TopicsRelationalRepository } from './repositories/topics.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicsEntity } from './entities/topics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TopicsEntity])],
  providers: [
    {
      provide: TopicsRepository,
      useClass: TopicsRelationalRepository,
    },
  ],
  exports: [TopicsRepository],
})
export class RelationalTopicsPersistenceModule {}
