import { TopicsMapper } from '../../../../../topics/infrastructure/persistence/relational/mappers/topics.mapper';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';
import { Story } from '../../../../domain/story';
import { StoryEntity } from '../entities/story.entity';

export class StoryMapper {
  static toDomain(raw: StoryEntity): Story {
    const domainEntity = new Story();
    domainEntity.abstract = raw.abstract;
    domainEntity.title = raw.title;
    domainEntity.id = raw.id;
    if (raw.humanBook) {
      domainEntity.humanBook = UserMapper.toDomain(raw.humanBook);
    }

    if (raw.topics) {
      domainEntity.topics = raw.topics.map((topic) =>
        TopicsMapper.toDomain(topic),
      );
    }
    domainEntity.topics = raw.topics;
    domainEntity.rating = raw.rating;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Story): StoryEntity {
    const persistenceEntity = new StoryEntity();
    persistenceEntity.abstract = domainEntity.abstract;
    persistenceEntity.title = domainEntity.title;
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    if (domainEntity.humanBook) {
      persistenceEntity.humanBook = UserMapper.toPersistence(
        domainEntity.humanBook,
      );
    }
    persistenceEntity.rating = domainEntity.rating;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
