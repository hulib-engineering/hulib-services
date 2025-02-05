import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BooksRepository } from './infrastructure/persistence/book.repository';
import { Book } from './domain/book';
import { createNewHumanBookDto } from './dto/create-new-human-book.dto';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { UserRepository } from '@users/infrastructure/persistence/user.repository';

@Injectable()
export class BooksService {
  constructor(
    private readonly booksRepository: BooksRepository,
    private readonly usersRepository: UserRepository,
  ) {}

  async createBook(createBookDto: createNewHumanBookDto): Promise<Book> {
    const authorId = createBookDto.authorId;
    const author = await this.usersRepository.findById(authorId);

    if (!author) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          photo: 'HumanBookNotExists',
        },
      });
    }

    const authorEntity: UserEntity = author as unknown as UserEntity;

    const book = {
      title: createBookDto.title,
      abstract: createBookDto.abstract || '',
      author: authorEntity,
      tag: createBookDto.tag || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.booksRepository.createBook(book);
  }

  async getHumanBookDetail(id: number) {
    const book = await this.booksRepository.findById(id);
    if (!book) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          photo: 'IdBookNotExists',
        },
      });
    }
    return book;
  }
}
