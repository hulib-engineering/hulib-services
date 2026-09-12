import { Prisma } from '@prisma/client';
import { Chat, ChatStatus } from '@chats/domain/chat';
import { ChatTypeEnum } from '@chat-types/chat-types.enum';
import { Sticker } from '../../../../../stickers/domain/sticker';
import {
  basicUserInclude,
  UserMapperImplement,
} from '@users/infrastructure/persistence/relational/mappers/user-mapper.implement';

export const chatInclude = {
  include: {
    sender: basicUserInclude,
    recipient: basicUserInclude,
    sticker: { include: { image: true } },
  },
} satisfies Prisma.chatDefaultArgs;

export type ChatRecord = Prisma.chatGetPayload<typeof chatInclude>;

export class ChatMapperImplement {
  static toDomain(raw: ChatRecord): Chat {
    const domain = new Chat();
    domain.id = raw.id;
    domain.message = raw.message ?? '';
    domain.senderId = raw.senderId;
    domain.recipientId = raw.recipientId;
    domain.status = raw.status as unknown as ChatStatus;
    domain.chatType =
      raw.chatTypeId != null
        ? { id: raw.chatTypeId, name: ChatTypeEnum[raw.chatTypeId] }
        : undefined;
    domain.readAt = raw.readAt ?? undefined;
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    domain.sender = UserMapperImplement.toDomain(raw.sender);
    domain.recipient = UserMapperImplement.toDomain(raw.recipient);

    if (raw.sticker) {
      const sticker = new Sticker();
      sticker.id = raw.sticker.id;
      sticker.name = raw.sticker.name;
      if (raw.sticker.image) {
        sticker.image = {
          id: raw.sticker.image.id,
          path: raw.sticker.image.path,
        };
      }
      sticker.createdAt = raw.sticker.createdAt;
      sticker.updatedAt = raw.sticker.updatedAt;
      domain.sticker = sticker;
    }

    return domain;
  }
}
