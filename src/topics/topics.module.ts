import { Module } from '@nestjs/common';
import { RelationalTopicsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';

import { CaslModule } from '@permission/casl.module';

@Module({
  imports: [RelationalTopicsPersistenceModule, CaslModule],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService, RelationalTopicsPersistenceModule],
})
export class TopicsModule {}
