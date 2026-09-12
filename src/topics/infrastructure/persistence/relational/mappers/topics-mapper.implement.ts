import { Prisma } from '@prisma/client';
import { Topics } from '@topics/domain/topics';

export type TopicsRecord = Prisma.topicsGetPayload<Record<string, never>>;

export class TopicsMapperImplement {
  static toDomain(raw: TopicsRecord): Topics {
    const domain = new Topics();
    domain.id = raw.id;
    domain.name = raw.name;
    domain.color = raw.color as unknown as Topics['color'];
    domain.status = raw.status as unknown as Topics['status'];
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    return domain;
  }
}
