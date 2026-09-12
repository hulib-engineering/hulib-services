import { Prisma } from '@prisma/client';
import { Message } from '@reading-sessions/domain/message';

export type MessageRecord = Prisma.messageGetPayload<Record<string, never>>;

export class MessageMapperImplement {
  static toDomain(raw: MessageRecord): Message {
    const domain = new Message();
    domain.id = raw.id;
    domain.readingSessionId = raw.readingSessionId;
    domain.humanBookId = raw.humanBookId;
    domain.readerId = raw.readerId;
    domain.content = raw.content;
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    domain.deletedAt = raw.deletedAt ?? undefined;
    return domain;
  }
}
