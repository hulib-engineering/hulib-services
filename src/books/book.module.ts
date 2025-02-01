import { Module } from '@nestjs/common';
import { BooksController } from './book.controller';
import { BooksService } from './book.service';
import { RelationalBookPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from '@users/users.module';

const infrastructurePersistenceModule = RelationalBookPersistenceModule;

@Module({
  imports: [infrastructurePersistenceModule, UsersModule],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService, infrastructurePersistenceModule],
})
export class BooksModule {}
