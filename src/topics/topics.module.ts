import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { RelationalTopicsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalTopicsPersistenceModule],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService, RelationalTopicsPersistenceModule],
})
export class TopicsModule {}
