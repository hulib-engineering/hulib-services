import { ReadingSession } from '@reading-sessions/domain';
import { ReadingSessionEntity } from '@reading-sessions/infrastructure/persistence/relational/entities';

import { UserMapper } from '@users/infrastructure/persistence/relational/mappers/user.mapper';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';

import { StoryMapper } from '@stories/infrastructure/persistence/relational/mappers/story.mapper';
import { FeedbackMapper } from './feedbacks.mapper';
import { MessageMapper } from './messages.mapper';

export class ReadingSessionMapper {
  static toDomain(entity: ReadingSessionEntity): ReadingSession {
    const domain = new ReadingSession();
    domain.id = entity.id;
    domain.humanBookId = entity.humanBookId;
    domain.readerId = entity.readerId;
    domain.storyId = entity.storyId;
    domain.sessionUrl = entity.sessionUrl;
    domain.note = entity.note;
    domain.rejectReason = entity.rejectReason;
    domain.recordingUrl = entity.recordingUrl;
    domain.sessionStatus = entity.sessionStatus;
    domain.startTime = entity.startTime;
    domain.endTime = entity.endTime;
    domain.startedAt = entity.startedAt;
    domain.endedAt = entity.endedAt;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;

    if (entity.humanBook) {
      domain.humanBook = UserMapper.toDomain(entity.humanBook as UserEntity);
    }
    if (entity.reader) {
      domain.reader = UserMapper.toDomain(entity.reader as UserEntity);
    }
    if (entity.story) {
      domain.story = StoryMapper.toDomain(entity.story);
    }
    if (entity.feedbacks) {
      domain.feedbacks = entity.feedbacks.map((feedback) =>
        FeedbackMapper.toDomain(feedback),
      );
    }
    if (entity.messages) {
      domain.messages = entity.messages.map((message) =>
        MessageMapper.toDomain(message),
      );
    }

    return domain;
  }

  static toPersistence(domain: ReadingSession): ReadingSessionEntity {
    const entity = new ReadingSessionEntity();
    entity.id = domain.id;
    entity.humanBookId = domain.humanBookId;
    entity.readerId = domain.readerId;
    entity.storyId = domain.storyId;
    entity.sessionUrl = domain.sessionUrl;
    entity.note = domain.note;
    entity.rejectReason = domain.rejectReason;
    // entity.review = domain.review;
    entity.recordingUrl = domain.recordingUrl;
    entity.sessionStatus = domain.sessionStatus;
    entity.startTime = domain.startTime;
    entity.endTime = domain.endTime;
    entity.startedAt = domain.startedAt;
    entity.endedAt = domain.endedAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;

    return entity;
  }
}
