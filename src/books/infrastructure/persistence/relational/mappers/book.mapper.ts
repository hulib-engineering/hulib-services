import { Book } from '@books/domain/book';
import { BookEntity } from '@books/infrastructure/persistence/relational/entities/book.entity';
import { UserMapper } from '@users/infrastructure/persistence/relational/mappers/user.mapper';
import { TagEntity } from '@tags/infrastructure/persistence/relational/entities/tag.entity';
import { Tag } from '@tags/domain/tag';

export class BooksMapper {
  static toDomain(raw: BookEntity): Book {
    const domainEntity = new Book();
    domainEntity.id = raw.id;
    domainEntity.title = raw.title;
    domainEntity.abstract = raw.abstract || '';
    domainEntity.author = raw.author;
    domainEntity.tag =
      raw.tag?.map(
        (tag) =>
          ({
            id: tag.id,
            content: tag.content,
          }) as Tag,
      ) || null;
    domainEntity.createdAt = raw.createdAt || null;
    domainEntity.updatedAt = raw.updatedAt || null;
    domainEntity.deletedAt = raw.deletedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Book): BookEntity {
    const persistenceEntity = new BookEntity();
    persistenceEntity.id = Number(domainEntity.id);
    persistenceEntity.title = domainEntity.title;
    persistenceEntity.abstract = domainEntity.abstract;
    persistenceEntity.author = UserMapper.toPersistence(domainEntity.author);
    persistenceEntity.tag =
      domainEntity.tag?.map((tag) => {
        const tagEntity = new TagEntity();
        tagEntity.id = Number(tag.id);
        tagEntity.content = tag.content;
        return tagEntity;
      }) || undefined;
    persistenceEntity.createdAt = domainEntity.createdAt || new Date();
    persistenceEntity.updatedAt = domainEntity.updatedAt || new Date();
    persistenceEntity.deletedAt = domainEntity.deletedAt || null;
    return persistenceEntity;
  }
}
