import { Module } from '@nestjs/common';
import { HumanBooksService } from './human-books.service';
import { HumanBooksController } from './human-books.controller';
import { RelationalHumanBooksPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from '../users/users.module';
import { TopicsModule } from '../topics/topics.module';

@Module({
  imports: [RelationalHumanBooksPersistenceModule, UsersModule, TopicsModule],
  controllers: [HumanBooksController],
  providers: [HumanBooksService],
  exports: [HumanBooksService, RelationalHumanBooksPersistenceModule],
})
export class HumanBooksModule {}
