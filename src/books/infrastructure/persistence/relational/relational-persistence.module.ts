import { Module } from '@nestjs/common';
import { BooksRepository } from '@books/infrastructure/persistence/book.repository';
import { BooksRelationalRepository } from './repositories/book.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookEntity } from '@books/infrastructure/persistence/relational/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookEntity])],
  providers: [
    {
      provide: BooksRepository,
      useClass: BooksRelationalRepository,
    },
  ],
  exports: [BooksRepository],
})
export class RelationalBookPersistenceModule {}
