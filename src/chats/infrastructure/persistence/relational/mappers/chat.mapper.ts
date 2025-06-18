import { ChatEntity } from '../entities/chat.entity';
import { Chat } from '../../../../domain/chat';
import { UserMapper } from '@users/infrastructure/persistence/relational/mappers/user.mapper';

export class ChatMapper {
  static toDomain(raw: Partial<ChatEntity>): Chat {
    const domain = new Chat();
    domain.dayOfWeek = raw.dayOfWeek ?? 0;
    domain.startTime = raw.startTime ?? '';
    domain.id = raw.id ?? 0;
    domain.huberId = raw.huberId ?? 0;
    if (raw.createdAt) {
      domain.createdAt = raw.createdAt;
    }
    if (raw.updatedAt) {
      domain.updatedAt = raw.updatedAt;
    }
    if (raw.huber) {
      domain.huber = UserMapper.toDomain(raw.huber);
    }

    return domain;
  }

  static toPersistence(domainEntity: Chat): ChatEntity {
    const persistenceEntity = new ChatEntity();
    persistenceEntity.dayOfWeek = domainEntity.dayOfWeek;
    persistenceEntity.startTime = domainEntity.startTime;
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.huberId = domainEntity.huberId;
    if (domainEntity.huber) {
      persistenceEntity.huber = UserMapper.toPersistence(domainEntity.huber);
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
