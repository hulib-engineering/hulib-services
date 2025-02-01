import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { RelationalStoriesPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

import { UsersModule } from '@users/users.module';

@Module({
  imports: [RelationalStoriesPersistenceModule, UsersModule],
  controllers: [StoriesController],
  providers: [StoriesService],
  exports: [StoriesService, RelationalStoriesPersistenceModule],
})
export class StoriesModule {}
