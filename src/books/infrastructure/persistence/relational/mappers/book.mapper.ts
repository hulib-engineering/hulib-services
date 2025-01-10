import { Book } from '../../../../domain/book'; // Domain model
import { BookEntity } from '../entities/book.entity'; // Persistence model
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper'; // Maps UserEntity <-> User
import { Tag } from '../../../../../tags/domain/tag'; // Tag domain model
import { TagEntity } from '../../../../../tags/infrastructure/persistence/relational/entities/tag.entity'; // Tag persistence model

export class BooksMapper {}
