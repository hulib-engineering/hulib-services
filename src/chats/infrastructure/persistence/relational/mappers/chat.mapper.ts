import { ChatEntity } from '../entities/chat.entity';
import { Chat, ChatStatus } from '../../../../domain/chat';
import { UserMapper } from '@users/infrastructure/persistence/relational/mappers/user.mapper';

export class ChatMapper {
  static toDomain(raw: Partial<ChatEntity>): Chat {
    const domain = new Chat();
    domain.message = raw.message ?? '';
    domain.id = raw.id ?? 0;
    domain.senderId = raw.senderId ?? 0;
    domain.recipientId = raw.recipientId ?? 0;
    domain.status = raw.status ?? ChatStatus.SENT;
    if (raw.createdAt) {
      domain.createdAt = raw.createdAt;
    }
    if (raw.updatedAt) {
      domain.updatedAt = raw.updatedAt;
    }
    if (raw.sender) {
      domain.sender = UserMapper.toDomain(raw.sender);
    }
    if (raw.recipient) {
      domain.recipient = UserMapper.toDomain(raw.recipient);
    }

    return domain;
  }

  static toPersistence(domainEntity: Chat): ChatEntity {
    const persistenceEntity = new ChatEntity();
    persistenceEntity.message = domainEntity.message;
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.senderId = domainEntity.senderId;
    persistenceEntity.recipientId = domainEntity.recipientId;
    persistenceEntity.status = domainEntity.status;
    if (domainEntity.sender) {
      persistenceEntity.sender = UserMapper.toPersistence(domainEntity.sender);
    }
    if (domainEntity.recipient) {
      persistenceEntity.recipient = UserMapper.toPersistence(
        domainEntity.recipient,
      );
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
