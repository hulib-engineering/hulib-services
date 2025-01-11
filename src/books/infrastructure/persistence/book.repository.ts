import { Book } from '../../domain/book';

export abstract class BooksRepository {
  abstract createBook(
    data: Omit<Book, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<Book>;
}
