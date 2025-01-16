import { Story } from '../../../../domain/story';
import { StoryEntity } from '../entities/story.entity';

export class StoryMapper {
  static toDomain(raw: StoryEntity): Story {
    const domainEntity = new Story();
    domainEntity.abstract = raw.abstract;
    domainEntity.title = raw.title;
    domainEntity.id = raw.id;
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
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
