import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { ReadingSession, ReadingSessionStatus } from '@reading-sessions/domain';
import { FindAllReadingSessionsQueryDto } from '@reading-sessions/dto/reading-session/find-all-reading-sessions-query.dto';

import {
  readingSessionInclude,
  ReadingSessionMapperImplement,
} from '../mappers/reading-session-mapper.implement';

// Default statuses shown when the caller doesn't ask for specific ones —
// mirrors the previous TypeORM repository's default filter exactly.
const DEFAULT_STATUSES: string[] = [
  ReadingSessionStatus.PENDING,
  ReadingSessionStatus.APPROVED,
  ReadingSessionStatus.MISSED,
  ReadingSessionStatus.FINISHED,
];

@Injectable()
export class ReadingSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(domain: ReadingSession): Promise<ReadingSession> {
    const created = await this.prisma.readingSession.create({
      data: {
        humanBookId: domain.humanBookId,
        readerId: domain.readerId,
        storyId: domain.storyId,
        sessionUrl: domain.sessionUrl,
        note: domain.note,
        rejectReason: domain.rejectReason,
        recordingUrl: domain.recordingUrl,
        sessionStatus:
          domain.sessionStatus as unknown as Prisma.readingSessionUncheckedCreateInput['sessionStatus'],
        startTime: domain.startTime,
        endTime: domain.endTime,
        startedAt: domain.startedAt,
        endedAt: domain.endedAt,
      },
      ...readingSessionInclude,
    });
    return ReadingSessionMapperImplement.toDomain(created);
  }

  async findById(id: number): Promise<ReadingSession | null> {
    const found = await this.prisma.readingSession.findUnique({
      where: { id },
      ...readingSessionInclude,
    });
    return found ? ReadingSessionMapperImplement.toDomain(found) : null;
  }

  // Replaces the old generic TypeORM `find()` — only ever used by
  // validateSessionOverlap, so scoped to exactly that query shape.
  async findOverlapping(
    humanBookId: number,
    startedAt: Date,
    endedAt: Date,
  ): Promise<ReadingSession[]> {
    const rows = await this.prisma.readingSession.findMany({
      where: {
        humanBookId,
        startedAt: { lte: endedAt },
        endedAt: { gte: startedAt },
      },
      ...readingSessionInclude,
    });
    return rows.map((row) => ReadingSessionMapperImplement.toDomain(row));
  }

  async findManyWithPagination({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions?: FindAllReadingSessionsQueryDto & { userId?: number };
    paginationOptions?: IPaginationOptions;
  }): Promise<ReadingSession[]> {
    const where: Prisma.readingSessionWhereInput = {};

    if (filterOptions?.humanBookId) {
      where.humanBookId = filterOptions.humanBookId;
    }
    if (filterOptions?.readerId) {
      where.readerId = filterOptions.readerId;
    }

    if (filterOptions?.sessionStatuses?.length) {
      where.sessionStatus = {
        in: filterOptions.sessionStatuses as unknown as string[],
      } as Prisma.readingSessionWhereInput['sessionStatus'];
    } else {
      where.sessionStatus = {
        in: DEFAULT_STATUSES,
      } as Prisma.readingSessionWhereInput['sessionStatus'];
    }

    if (filterOptions?.upcoming) {
      where.startedAt = { gt: new Date() };
      where.sessionStatus =
        ReadingSessionStatus.APPROVED as unknown as Prisma.readingSessionWhereInput['sessionStatus'];
    }

    if (filterOptions?.startedAt && filterOptions?.endedAt) {
      where.startedAt = {
        gte: new Date(filterOptions.startedAt),
        lte: new Date(filterOptions.endedAt),
      };
    } else if (filterOptions?.startedAt) {
      where.startedAt = { gte: new Date(filterOptions.startedAt) };
    } else if (filterOptions?.endedAt) {
      where.startedAt = { lte: new Date(filterOptions.endedAt) };
    }

    const findArgs: Prisma.readingSessionFindManyArgs = {
      where: {
        OR: [
          { ...where, humanBookId: filterOptions?.userId },
          { ...where, readerId: filterOptions?.userId },
        ],
      },
      ...readingSessionInclude,
    };

    if (filterOptions?.upcoming) {
      findArgs.orderBy = { startedAt: 'asc' };
      findArgs.take = 1;
    }

    if (paginationOptions) {
      findArgs.skip = (paginationOptions.page - 1) * paginationOptions.limit;
      findArgs.take = paginationOptions.limit;
    }

    const rows = await this.prisma.readingSession.findMany(findArgs);
    return rows.map((row) => ReadingSessionMapperImplement.toDomain(row));
  }

  async update(
    id: number,
    domain: Partial<ReadingSession>,
  ): Promise<ReadingSession> {
    const updated = await this.prisma.readingSession.update({
      where: { id },
      data: {
        humanBookId: domain.humanBookId,
        readerId: domain.readerId,
        storyId: domain.storyId,
        sessionUrl: domain.sessionUrl,
        note: domain.note,
        rejectReason: domain.rejectReason,
        recordingUrl: domain.recordingUrl,
        sessionStatus:
          domain.sessionStatus as unknown as Prisma.readingSessionUncheckedUpdateInput['sessionStatus'],
        startTime: domain.startTime,
        endTime: domain.endTime,
        startedAt: domain.startedAt,
        endedAt: domain.endedAt,
        rating: domain.rating,
        preRating: domain.preRating,
      },
    });
    return ReadingSessionMapperImplement.toDomain(updated);
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.readingSession.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
