import { ChatEntity } from '../entities/chat.entity';
import { Chat, ChatStatus } from '../../../../domain/chat';
import { UserMapper } from '@users/infrastructure/persistence/relational/mappers/user.mapper';
import { ChatTypeEntity } from '@chat-types/infrastructure/persistence/relational/entities/chat-type.entity';
import { ChatTypeEnum } from '@chat-types/chat-types.enum';
import { StickerEntity } from '../../../../../stickers/infrastructure/persistence/relational/entities/sticker.entity';
import { StickerMapper } from '../../../../../stickers/infrastructure/persistence/relational/mappers/sticker.mapper';

export class ChatMapper {
  static toDomain(raw: Partial<ChatEntity>): Chat {
    const domain = new Chat();
    domain.message = raw.message ?? '';
    domain.id = raw.id ?? 0;
    domain.senderId = raw.senderId ?? 0;
    domain.recipientId = raw.recipientId ?? 0;
    domain.status = raw.status ?? ChatStatus.SENT;
    domain.chatType = raw.chatType;

    if (raw.createdAt) {
      domain.createdAt = raw.createdAt;
    }
    if (raw.updatedAt) {
      domain.updatedAt = raw.updatedAt;
    }
    if (raw.readAt) {
      domain.readAt = raw.readAt;
    }
    if (raw.sender) {
      domain.sender = UserMapper.toDomain(raw.sender);
    }
    if (raw.recipient) {
      domain.recipient = UserMapper.toDomain(raw.recipient);
    }
    if (raw.sticker) {
      domain.sticker = StickerMapper.toDomain(raw.sticker);
    }

    return domain;
  }

  static toPersistence(domainEntity: Chat): ChatEntity {
    const persistenceEntity = new ChatEntity();
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

    let chatType: ChatTypeEntity | undefined = undefined;

    if (domainEntity.chatType) {
      chatType = new ChatTypeEntity();
      chatType.id = Number(domainEntity.chatType.id);
      chatType.name = ChatTypeEnum[String(chatType.id)];
    }

    let sticker: StickerEntity | null = null;
    let message: string = domainEntity.message;

    if (
      domainEntity.chatType &&
      domainEntity.chatType?.id === ChatTypeEnum.img
    ) {
      message = domainEntity.chatType?.name ?? '';
      if (domainEntity.message !== '') {
        sticker = new StickerEntity();
        sticker.id = parseInt(domainEntity.message);
      } else {
        sticker = null;
      }
    }

    persistenceEntity.chatType = chatType;
    persistenceEntity.message = message;
    persistenceEntity.sticker = sticker;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
