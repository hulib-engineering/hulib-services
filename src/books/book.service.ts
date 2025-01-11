import { Injectable } from '@nestjs/common';
import { BooksRepository } from './infrastructure/persistence/book.repository';
import { Book } from './domain/book';
import { createNewHumanBookDto } from './dto/create-new-human-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly booksRepository: BooksRepository) {}

  async createBook(createBookDto: createNewHumanBookDto): Promise<Book> {
    const book = {
      title: createBookDto.title ?? '',
      abstract: createBookDto.abstract ?? null,
      author: createBookDto.author,
      tag: createBookDto.tag || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.booksRepository.createBook(book);
  }
}
