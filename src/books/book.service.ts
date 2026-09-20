import { Injectable, NotImplementedException } from '@nestjs/common';
import { Book } from './domain/book';
import { createNewHumanBookDto } from './dto/create-new-human-book.dto';

// The "books" feature (title/abstract/tag, distinct from a story) predates
// the current Prisma schema — there is no `books` or `tag` model/table, and
// none was ever migrated from the old TypeORM setup. The persistence layer
// was removed as dead code; these routes are left as an explicit stub
// rather than silently doing nothing.
@Injectable()
export class BooksService {
  createBook(createBookDto: createNewHumanBookDto): Promise<Book> {
    void createBookDto;
    return Promise.reject(
      new NotImplementedException(
        'Books feature has no backing schema and is not implemented',
      ),
    );
  }

  getHumanBookDetail(id: number) {
    void id;
    return Promise.reject(
      new NotImplementedException(
        'Books feature has no backing schema and is not implemented',
      ),
    );
  }
}
