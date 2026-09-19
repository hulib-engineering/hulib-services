import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { NullableType } from '@utils/types/nullable.type';
import { User } from '@users/domain/user';
import { basicUserInclude, UserMapperImplement } from '@users/user-mapper';
import { TimeSlot } from './domain/time-slot';

const timeSlotInclude = {
  include: { huber: basicUserInclude },
} satisfies Prisma.timeSlotDefaultArgs;

type TimeSlotRecord = Prisma.timeSlotGetPayload<typeof timeSlotInclude>;

function toDomain(raw: Partial<TimeSlotRecord>): TimeSlot {
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

@Injectable()
export class TimeSlotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: TimeSlot, user: User): Promise<TimeSlot> {
    const created = await this.prisma.timeSlot.create({
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        huberId: Number(user.id),
      },
      ...timeSlotInclude,
    });
    return toDomain(created);
  }

  async createMany(data: TimeSlot[], user: User): Promise<TimeSlot[]> {
    return this.prisma.$transaction(async (tx) => {
      await tx.timeSlot.deleteMany({
        where: { huberId: Number(user.id) },
      });

      await tx.timeSlot.createMany({
        data: data.map((timeSlot) => ({
          dayOfWeek: timeSlot.dayOfWeek,
          startTime: timeSlot.startTime,
          huberId: Number(user.id),
        })),
      });

      const timeSlots = await tx.timeSlot.findMany({
        where: { huberId: Number(user.id) },
      });

      return timeSlots.map((timeSlot) => toDomain(timeSlot));
    });
  }

  async findAll(): Promise<TimeSlot[]> {
    const rows = await this.prisma.timeSlot.findMany();
    return rows.map((row) => toDomain(row));
  }

  async findById(id: TimeSlot['id']): Promise<NullableType<TimeSlot>> {
    const found = await this.prisma.timeSlot.findUnique({
      where: { id: Number(id) },
    });
    return found ? toDomain(found) : null;
  }

  async findByUser(userId: User['id']): Promise<TimeSlot[]> {
    const rows = await this.prisma.timeSlot.findMany({
      where: { huberId: Number(userId) },
      ...timeSlotInclude,
    });
    return rows.map((row) => toDomain(row));
  }

  async findByTime(
    dayOfWeek: TimeSlot['dayOfWeek'],
    startTime: TimeSlot['startTime'],
  ): Promise<NullableType<TimeSlot>> {
    const found = await this.prisma.timeSlot.findFirst({
      where: { dayOfWeek, startTime },
    });
    return found ? toDomain(found) : null;
  }

  async remove(id: TimeSlot['id']): Promise<void> {
    await this.prisma.timeSlot.delete({ where: { id: Number(id) } });
  }

  async update(data: TimeSlot): Promise<TimeSlot> {
    await this.prisma.timeSlot.update({
      where: { id: Number(data.id) },
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
      },
    });
    // Mirrors the previous TypeORM repository, which also returned the
    // input domain object as-is rather than the freshly persisted row.
    return data;
  }

  async findByDayOfWeek(dayOfWeek: TimeSlot['dayOfWeek']): Promise<TimeSlot[]> {
    const rows = await this.prisma.timeSlot.findMany({
      where: { dayOfWeek },
    });
    return rows.map((row) => toDomain(row));
  }
}