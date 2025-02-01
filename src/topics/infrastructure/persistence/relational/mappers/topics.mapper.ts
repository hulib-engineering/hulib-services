import { Topics } from '@topics/domain/topics';
import { TopicsEntity } from '@topics/infrastructure/persistence/relational/entities/topics.entity';

export class TopicsMapper {
  static toDomain(raw: TopicsEntity): Topics {
    const domainEntity = new Topics();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Topics): TopicsEntity {
    const persistenceEntity = new TopicsEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.name = domainEntity.name;
    return persistenceEntity;
  }
}
