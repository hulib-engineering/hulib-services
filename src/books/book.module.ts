import { Module } from '@nestjs/common';
import { BooksController } from './book.controller';
import { BooksService } from './book.service';
import { RelationalUserPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesModule } from '../files/files.module';

const infrastructurePersistenceModule = RelationalUserPersistenceModule;

@Module({
  imports: [infrastructurePersistenceModule, FilesModule],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService, infrastructurePersistenceModule],
})
export class BookModule {}
