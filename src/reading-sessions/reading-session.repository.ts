import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { ReadingSession, ReadingSessionStatus } from './domain';
import { Story } from '@stories/domain/story';
import { PublishStatus } from '@stories/status.enum';
import { basicUserInclude, UserMapperImplement } from '@users/user-mapper';
import { FindAllReadingSessionsQueryDto } from './dto/reading-session/find-all-reading-sessions-query.dto';
import { messageToDomain } from './message.repository';

export const readingSessionInclude = {
  include: {
    humanBook: basicUserInclude,
    reader: basicUserInclude,
    story: true,
    messages: true,
  },
} satisfies Prisma.readingSessionDefaultArgs;

type ReadingSessionRecord = Prisma.readingSessionGetPayload<
  typeof readingSessionInclude
>;

// A plain (no relations) row, e.g. straight out of `prisma.readingSession.update()` —
// toDomain accepts either shape so callers that don't need relations back
// (the repository's own `update()`) don't have to fake one.
type ReadingSessionRow = Prisma.readingSessionGetPayload<
  Record<string, never>
> &
  Partial<
    Pick<ReadingSessionRecord, 'humanBook' | 'reader' | 'story' | 'messages'>
  >;

// Mirrors the old TypeORM StoryMapper.toDomain, which only ever populated
// scalar story fields here since reading-sessions never loaded story's own
// cover/humanBook/topics relations — kept scalar-only for parity.
function toLightStory(raw: ReadingSessionRecord['story']): Story {
  const story = new Story();
  story.id = raw.id;
  story.title = raw.title;
  story.abstract = raw.abstract;
  story.publishStatus = PublishStatus[raw.publishStatus];
  story.viewCount = raw.viewCount ?? 0;
  story.shareCount = raw.shareCount ?? 0;
  story.sharedUserIds = raw.sharedUserIds ?? [];
  story.likeCount = raw.likeCount ?? 0;
  story.likedUserIds = raw.likedUserIds ?? [];
  story.createdAt = raw.createdAt;
  story.updatedAt = raw.updatedAt;
  if (raw.rejectionReason) {
    story.rejectionReason = raw.rejectionReason;
  }
  return story;
}

export function readingSessionToDomain(raw: ReadingSessionRow): ReadingSession {
  const domain = new ReadingSession();
  domain.id = raw.id;
  domain.humanBookId = raw.humanBookId;
  domain.readerId = raw.readerId;
  domain.storyId = raw.storyId;
  domain.sessionUrl = raw.sessionUrl;
  domain.note = raw.note ?? undefined;
  domain.rejectReason = raw.rejectReason ?? undefined;
  domain.recordingUrl = raw.recordingUrl ?? undefined;
  domain.sessionStatus = raw.sessionStatus as unknown as ReadingSessionStatus;
  domain.startTime = raw.startTime;
  domain.endTime = raw.endTime;
  domain.startedAt = raw.startedAt;
  domain.endedAt = raw.endedAt;
  domain.createdAt = raw.createdAt;
  domain.updatedAt = raw.updatedAt;
  domain.deletedAt = raw.deletedAt ?? undefined;
  domain.rating = raw.rating;
  domain.preRating = raw.preRating;

  if (raw.humanBook) {
    domain.humanBook = UserMapperImplement.toDomain(raw.humanBook);
  }
  if (raw.reader) {
    domain.reader = UserMapperImplement.toDomain(raw.reader);
  }
  if (raw.story) {
    domain.story = toLightStory(raw.story);
  }
  if (raw.messages) {
    domain.messages = raw.messages.map((message) => messageToDomain(message));
  }

  return domain;
}

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
    return readingSessionToDomain(created);
  }

  async findById(id: number): Promise<ReadingSession | null> {
    const found = await this.prisma.readingSession.findUnique({
      where: { id },
      ...readingSessionInclude,
    });
    return found ? readingSessionToDomain(found) : null;
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
    return rows.map((row) => readingSessionToDomain(row));
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
    return rows.map((row) => readingSessionToDomain(row));
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
    return readingSessionToDomain(updated);
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.readingSession.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
