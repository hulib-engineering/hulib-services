import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { NullableType } from '@utils/types/nullable.type';
import { User } from '@users/domain/user';
import { ChatTypeEnum } from '@chat-types/chat-types.enum';
import { Chat, ChatStatus } from './domain/chat';
import { Sticker } from '../stickers/domain/sticker';
import { basicUserInclude, UserMapperImplement } from '@users/user-mapper';

export const chatInclude = {
  include: {
    sender: basicUserInclude,
    recipient: basicUserInclude,
    sticker: { include: { image: true } },
  },
} satisfies Prisma.chatDefaultArgs;

type ChatRecord = Prisma.chatGetPayload<typeof chatInclude>;

function toDomain(raw: ChatRecord): Chat {
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

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>,
    sender: User,
    recipient: User,
  ): Promise<Chat> {
    const { message, stickerId } = this.resolveMessageAndSticker(data);

    const created = await this.prisma.chat.create({
      data: {
        senderId: Number(sender.id),
        recipientId: Number(recipient.id),
        message,
        status:
          data.status as unknown as Prisma.chatUncheckedCreateInput['status'],
        chatTypeId:
          data.chatType?.id != null ? Number(data.chatType.id) : undefined,
        stickerId,
      },
      ...chatInclude,
    });

    return toDomain(created);
  }

  async findByUser(userId: User['id']): Promise<Chat[]> {
    const rows = await this.prisma.chat.findMany({
      where: {
        OR: [
          { senderId: Number(userId), status: { not: 'deleted' } },
          { recipientId: Number(userId), status: { not: 'deleted' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      ...chatInclude,
    });

    return rows.map((row) => toDomain(row));
  }

  async findByUsers(user1: User['id'], user2: User['id']): Promise<Chat[]> {
    const rows = await this.prisma.chat.findMany({
      where: {
        OR: [
          {
            senderId: Number(user1),
            recipientId: Number(user2),
            status: { not: 'deleted' },
          },
          {
            senderId: Number(user2),
            recipientId: Number(user1),
            status: { not: 'deleted' },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      ...chatInclude,
    });

    return rows.map((row) => toDomain(row));
  }

  async findById(id: Chat['id']): Promise<NullableType<Chat>> {
    const found = await this.prisma.chat.findFirst({
      where: { id: Number(id), status: { not: 'deleted' } },
      ...chatInclude,
    });

    return found ? toDomain(found) : null;
  }

  async update(data: Chat): Promise<Chat> {
    const { message, stickerId } = this.resolveMessageAndSticker(data);

    const updated = await this.prisma.chat.update({
      where: { id: Number(data.id) },
      data: {
        message,
        status:
          data.status as unknown as Prisma.chatUncheckedUpdateInput['status'],
        chatTypeId:
          data.chatType?.id != null ? Number(data.chatType.id) : undefined,
        stickerId,
        updatedAt: new Date(),
      },
      ...chatInclude,
    });

    return toDomain(updated);
  }

  async markMessagesAsRead(
    from: Chat['senderId'],
    to: Chat['recipientId'],
  ): Promise<void> {
    await this.prisma.chat.updateMany({
      where: {
        recipientId: to,
        senderId: from,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  async countUnreadMessages(
    userId: User['id'],
  ): Promise<{ senderId: number; unread: number }[]> {
    const unreadCounts = await this.prisma.chat.groupBy({
      by: ['senderId'],
      where: {
        recipientId: Number(userId),
        readAt: null,
      },
      _count: {
        id: true,
      },
    });

    return unreadCounts.map((item) => ({
      senderId: item.senderId,
      unread: item._count.id,
    }));
  }

  // Mirrors the previous mapper's convention: an "img" chatType repurposes
  // the message field to carry a sticker id (as a numeric string) rather
  // than free text, and the persisted message becomes the chatType's
  // display name. Any other chatType always clears a previously-set sticker.
  private resolveMessageAndSticker(data: Pick<Chat, 'message' | 'chatType'>): {
    message: string;
    stickerId: number | null;
  } {
    if (data.chatType && data.chatType.id === ChatTypeEnum.img) {
      const stickerId = data.message !== '' ? parseInt(data.message) : null;
      return { message: ChatTypeEnum[ChatTypeEnum.img], stickerId };
    }
    return { message: data.message, stickerId: null };
  }
}
