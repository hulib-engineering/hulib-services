import { Prisma } from '@prisma/client';
import { Moderation } from '@moderations/domain/moderation';

export type ModerationRecord = Prisma.moderationGetPayload<
  Record<string, never>
>;

export class ModerationMapperImplement {
  static toDomain(raw: ModerationRecord): Moderation {
    const domain = new Moderation();
    domain.id = raw.id;
    domain.actionType = raw.actionType as unknown as Moderation['actionType'];
    domain.status = raw.status as unknown as Moderation['status'];
    domain.userId = raw.userId;
    domain.reportId = raw.reportId;
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    return domain;
  }
}
