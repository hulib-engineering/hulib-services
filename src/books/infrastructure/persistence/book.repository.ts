import { Book } from '@books/domain/book';

export abstract class BooksRepository {
  abstract createBook(
    data: Omit<Book, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<Book>;

  abstract findById(id: number): Promise<Book | null>;
}
