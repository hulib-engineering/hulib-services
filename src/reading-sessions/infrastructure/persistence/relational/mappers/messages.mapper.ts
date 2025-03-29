import { Message } from '../../../../domain/message';
import { MessageEntity } from '../entities/message.entity';
import { UserMapper } from '@users/infrastructure/persistence/relational/mappers/user.mapper';
import { ReadingSessionMapper } from './reading-sessions.mapper';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';

export class MessageMapper {
  static toDomain(entity: MessageEntity): Message {
    const domain = new Message();
    domain.id = entity.id;
    domain.readingSessionId = entity.readingSessionId;
    domain.humanBookId = entity.humanBookId;
    domain.readerId = entity.readerId;
    domain.content = entity.content;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;

    if (entity.readingSession) {
      domain.readingSession = ReadingSessionMapper.toDomain(
        entity.readingSession,
      );
    }
    if (entity.humanBook) {
      domain.humanBook = UserMapper.toDomain(entity.humanBook as UserEntity);
    }
    if (entity.reader) {
      domain.reader = UserMapper.toDomain(entity.reader as UserEntity);
    }

    return domain;
  }

  static toPersistence(domain: Message): MessageEntity {
    const entity = new MessageEntity();
    entity.id = domain.id;
    entity.readingSessionId = domain.readingSessionId;
    entity.humanBookId = domain.humanBookId;
    entity.readerId = domain.readerId;
    entity.content = domain.content;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;

    return entity;
  }
}
