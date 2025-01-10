import { Injectable } from '@nestjs/common';
import { FilesService } from '../files/files.service';
import { BooksRepository } from './infrastructure/persistence/book.repository';

@Injectable()
export class BooksService {
  constructor(
    private readonly booksRepository: BooksRepository,
    private readonly filesService: FilesService,
  ) {}
}
