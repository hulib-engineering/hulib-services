import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooksRepository } from '../../book.repository';
import { Book } from '../../../../domain/book';
import { BookEntity } from '../entities/book.entity';
import { BooksMapper } from '../mappers/book.mapper';

@Injectable()
export class BooksRelationalRepository extends BooksRepository {
  constructor(
    @InjectRepository(BookEntity)
    private readonly booksRepository: Repository<BookEntity>,
  ) {
    super();
  }

  async createBook(book: Book): Promise<Book> {
    const bookEntity = BooksMapper.toPersistence(book);
    const createdBook = await this.booksRepository.save(bookEntity);
    return BooksMapper.toDomain(createdBook);
  }
}
