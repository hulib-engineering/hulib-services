import { Injectable, NotFoundException } from '@nestjs/common';
import { BooksRepository } from './infrastructure/persistence/book.repository';
import { Book } from './domain/book';
import { createNewHumanBookDto } from './dto/create-new-human-book.dto';
import { HumanBookDetailDto } from './dto/human-book-detail.dto';

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

  async getHumanBookDetail(id: number): Promise<HumanBookDetailDto> {
    const book = await this.booksRepository.findById(id);
    if (!book) {
      throw new NotFoundException('Not found');
    }

    return {
      id: typeof book.id === 'string' ? parseInt(book.id, 10) : book.id,
      authorName: book.author.fullName ?? '',
      title: book.title,
      abstract: book.abstract ?? '',
      tags: book.tag || [],
      author: book.author,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }
}
