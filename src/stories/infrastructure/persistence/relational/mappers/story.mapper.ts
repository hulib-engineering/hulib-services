import { UserMapper } from '@users/infrastructure/persistence/relational/mappers/user.mapper';
import { Story } from '@stories/domain/story';
import { StoryEntity } from '@stories/infrastructure/persistence/relational/entities/story.entity';
import { TopicsMapper } from '@topics/infrastructure/persistence/relational/mappers/topics.mapper';
import { PublishStatus } from '@stories/status.enum';
import { FileMapper } from '@files/infrastructure/persistence/relational/mappers/file.mapper';

export class StoryMapper {
  static toDomain(raw: StoryEntity): Story {
    const domainEntity = new Story();
    domainEntity.abstract = raw.abstract;
    domainEntity.title = raw.title;
    domainEntity.id = raw.id;

    if (raw.cover) {
      domainEntity.cover = FileMapper.toDomain(raw.cover);
    }

    if (raw.humanBook) {
      domainEntity.humanBook = UserMapper.toDomain(raw.humanBook);
    }

    if (raw.topics) {
      domainEntity.topics = raw.topics.map((topic) =>
        TopicsMapper.toDomain(topic),
      );
    }
    if (raw.rejectionReason) {
      domainEntity.rejectionReason = raw.rejectionReason;
    }
    domainEntity.topics = raw.topics;
    // domainEntity.rating = raw.rating;
    domainEntity.publishStatus = PublishStatus[raw.publishStatus];
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Story): StoryEntity {
    const persistenceEntity = new StoryEntity();
    persistenceEntity.abstract = domainEntity.abstract;
    persistenceEntity.title = domainEntity.title;

    if (domainEntity.id !== undefined && domainEntity.id !== null) {
      persistenceEntity.id = domainEntity.id;
    }

    if (domainEntity.humanBook) {
      persistenceEntity.humanBook = UserMapper.toPersistence(
        domainEntity.humanBook,
      );
    }
    if (domainEntity.topics) {
      persistenceEntity.topics = domainEntity.topics.map((topic) =>
        TopicsMapper.toPersistence(topic),
      );
    }
    if (domainEntity.rejectionReason) {
      persistenceEntity.rejectionReason = domainEntity.rejectionReason;
    }
    // persistenceEntity.rating = domainEntity.rating;
    persistenceEntity.publishStatus =
      PublishStatus[domainEntity.publishStatus as keyof typeof PublishStatus];
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
