import { TopicsEntity } from '../../../../../topics/infrastructure/persistence/relational/entities/topics.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { HumanBooks } from '../../../../domain/human-books';
import { HumanBooksEntity } from '../entities/human-books.entity';
import { TopicsMapper } from '../../../../../topics/infrastructure/persistence/relational/mappers/topics.mapper';
export class HumanBooksMapper {
  static toDomain(raw: HumanBooksEntity): HumanBooks {
    const domainEntity = new HumanBooks();

    if (raw.topics) {
      domainEntity.topics = raw.topics.map((topic) =>
        TopicsMapper.toDomain(topic),
      );
    }

    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.user = raw.user;
    domainEntity.bio = raw.bio;
    domainEntity.videoUrl = raw.videoUrl;
    domainEntity.education = raw.education;
    domainEntity.educationStart = raw.educationStart;
    domainEntity.educationEnd = raw.educationEnd;

    return domainEntity;
  }

  static toPersistence(domainEntity: HumanBooks): HumanBooksEntity {
    const persistenceEntity = new HumanBooksEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    let user: UserEntity | null | undefined = undefined;

    if (domainEntity.user) {
      user = new UserEntity();
      user.id = Number(domainEntity.user.id);
      persistenceEntity.user = user;
    }

    if (domainEntity.topics) {
      persistenceEntity.topics = domainEntity.topics.map((topic) => {
        const topicEntity = new TopicsEntity();
        topicEntity.id = topic.id;
        return topicEntity;
      });
    }

    if (domainEntity.educationEnd) {
      persistenceEntity.educationEnd = domainEntity.educationEnd;
    }

    persistenceEntity.bio = domainEntity.bio;
    persistenceEntity.videoUrl = domainEntity.videoUrl;
    persistenceEntity.education = domainEntity.education;
    persistenceEntity.educationStart = domainEntity.educationStart;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
