import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsRepository } from './topics.repository';
import { TopicsController } from './topics.controller';

import { CaslModule } from '@permission/casl.module';

@Module({
  imports: [CaslModule],
  controllers: [TopicsController],
  providers: [TopicsService, TopicsRepository],
  exports: [TopicsService, TopicsRepository],
})
export class TopicsModule {}
