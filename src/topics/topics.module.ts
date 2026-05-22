import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { RelationalTopicsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

import { CaslModule } from '@casl/casl.module';

@Module({
  imports: [RelationalTopicsPersistenceModule, CaslModule],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService, RelationalTopicsPersistenceModule],
})
export class TopicsModule {}
