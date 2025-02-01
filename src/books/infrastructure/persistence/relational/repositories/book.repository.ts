import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooksRepository } from '@books/infrastructure/persistence/book.repository';
import { Book } from '@books/domain/book';
import { BookEntity } from '@books/infrastructure/persistence/relational/entities/book.entity';
import { BooksMapper } from '@books/infrastructure/persistence/relational/mappers/book.mapper';

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

  async findById(id: Book['id']): Promise<Book | null> {
    const bookEntity = await this.booksRepository.findOne({
      where: { id: Number(id) },
      relations: ['author', 'tag'],
    });

    return bookEntity ? BooksMapper.toDomain(bookEntity) : null;
  }
}
