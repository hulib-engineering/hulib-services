import { Prisma } from '@prisma/client';
import { TimeSlot } from '../../../../domain/time-slot';
import {
  basicUserInclude,
  UserMapperImplement,
} from '@users/infrastructure/persistence/relational/mappers/user-mapper.implement';

export const timeSlotInclude = {
  include: { huber: basicUserInclude },
} satisfies Prisma.timeSlotDefaultArgs;

export type TimeSlotRecord = Prisma.timeSlotGetPayload<typeof timeSlotInclude>;

export class TimeSlotMapperImplement {
  static toDomain(raw: Partial<TimeSlotRecord>): TimeSlot {
    const domain = new TimeSlot();
    domain.id = raw.id ?? 0;
    domain.dayOfWeek = raw.dayOfWeek ?? 0;
    domain.startTime = raw.startTime ?? '';
    domain.huberId = raw.huberId ?? 0;
    if (raw.createdAt) {
      domain.createdAt = raw.createdAt;
    }
    if (raw.updatedAt) {
      domain.updatedAt = raw.updatedAt;
    }
    if (raw.huber) {
      domain.huber = UserMapperImplement.toDomain(raw.huber);
    }
    return domain;
  }
}
