import { Feedback } from '@reading-sessions/domain';
import { FeedbackEntity } from '@reading-sessions/infrastructure/persistence/relational/entities';

// import { ReadingSessionMapper } from './reading-sessions.mapper';

export class FeedbackMapper {
  static toDomain(entity: FeedbackEntity): Feedback {
    const domain = new Feedback();
    domain.id = entity.id;
    // domain.readingSessionId = entity.readingSessionId;
    domain.rating = entity.rating;
    domain.content = entity.content;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;

    // if (entity.readingSession) {
    //   domain.readingSession = ReadingSessionMapper.toDomain(
    //     entity.readingSession,
    //   );
    // }

    return domain;
  }

  static toPersistence(domain: Feedback): FeedbackEntity {
    const entity = new FeedbackEntity();
    entity.id = domain.id;
    entity.rating = domain.rating;
    entity.content = domain.content;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;

    return entity;
  }
}
