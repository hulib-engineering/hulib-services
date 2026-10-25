import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { ReadingSession, ReadingSessionStatus } from './domain';
import { Story } from '@stories/domain/story';
import { PublishStatus } from '@stories/status.enum';
import { basicUserInclude, UserMapperImplement } from '@users/user-mapper';
import {
  DEFAULT_READING_SESSIONS_LIMIT,
  FindAllReadingSessionsQueryDto,
} from './dto/reading-session/find-all-reading-sessions-query.dto';
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
  domain.huberJoinedAt = raw.huberJoinedAt ?? undefined;
  domain.readerJoinedAt = raw.readerJoinedAt ?? undefined;
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

// Counts backing the filter tabs in the client.
export interface ReadingSessionFilterCounts {
  all: number;
  approved: number;
  pending: number;
  finished: number;
  missed: number;
}

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

  // Ownership and id scoping, with no time or status constraints. Shared by the
  // list query and the per-tab count breakdown.
  private buildScope(
    filterOptions:
      | (FindAllReadingSessionsQueryDto & { userId?: number })
      | undefined,
    sessionStatuses?: ReadingSessionStatus[],
  ): Prisma.readingSessionWhereInput {
    const scoped: Prisma.readingSessionWhereInput = {
      sessionStatus: {
        in: (sessionStatuses?.length
          ? sessionStatuses
          : DEFAULT_STATUSES) as string[],
      } as Prisma.readingSessionWhereInput['sessionStatus'],
      OR: [
        { humanBookId: filterOptions?.userId },
        { readerId: filterOptions?.userId },
      ],
    };

    if (filterOptions?.humanBookId) {
      scoped.humanBookId = filterOptions.humanBookId;
    }
    if (filterOptions?.readerId) {
      scoped.readerId = filterOptions.readerId;
    }
    if (filterOptions?.storyId) {
      scoped.storyId = filterOptions.storyId;
    }

    return scoped;
  }

  // Builds the `where` for the list query. `overrides` lets the per-tab count
  // breakdown reuse this exact scoping with a different status filter.
  private buildSessionWhere(
    filterOptions:
      | (FindAllReadingSessionsQueryDto & { userId?: number })
      | undefined,
    overrides: { sessionStatuses?: ReadingSessionStatus[] } = {},
  ): Prisma.readingSessionWhereInput {
    const and: Prisma.readingSessionWhereInput[] = [];

    // The explicit date params AND together instead of overwriting each other.
    if (filterOptions?.startedAt) {
      and.push({ startedAt: { gte: new Date(filterOptions.startedAt) } });
    }
    if (filterOptions?.endedAt) {
      and.push({ startedAt: { lte: new Date(filterOptions.endedAt) } });
    }

    const scoped = this.buildScope(
      filterOptions,
      overrides.sessionStatuses ?? filterOptions?.sessionStatuses,
    );
    return and.length ? { ...scoped, AND: and } : scoped;
  }

  // Per-filter-option counts for the tab badges. Each option is counted
  // against the caller's own sessions with only that option's status filter
  // applied, so the numbers stay correct no matter which tab is selected.
  async countByFilterOption(
    filterOptions?: FindAllReadingSessionsQueryDto & { userId?: number },
  ): Promise<ReadingSessionFilterCounts> {
    const statuses = [
      ReadingSessionStatus.APPROVED,
      ReadingSessionStatus.PENDING,
      ReadingSessionStatus.FINISHED,
      ReadingSessionStatus.MISSED,
    ];

    const [all, ...byStatus] = await this.prisma.$transaction([
      this.prisma.readingSession.count({
        where: this.buildScope(filterOptions),
      }),
      ...statuses.map((status) =>
        this.prisma.readingSession.count({
          where: this.buildScope(filterOptions, [status]),
        }),
      ),
    ]);

    return {
      all,
      approved: byStatus[0],
      pending: byStatus[1],
      finished: byStatus[2],
      missed: byStatus[3],
    };
  }

  async findManyWithPagination({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions?: FindAllReadingSessionsQueryDto & { userId?: number };
    paginationOptions?: IPaginationOptions;
  }): Promise<{ data: ReadingSession[]; count: number }> {
    const where = this.buildSessionWhere(filterOptions);

    const findArgs: Prisma.readingSessionFindManyArgs = {
      where,
      // Sorted on `id` as well as `startedAt` so rows with an identical start
      // time keep a stable order — otherwise offset pagination can repeat or
      // drop rows across page boundaries.
      orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
      take: paginationOptions?.limit ?? DEFAULT_READING_SESSIONS_LIMIT,
      ...readingSessionInclude,
    };

    if (paginationOptions) {
      findArgs.skip = (paginationOptions.page - 1) * paginationOptions.limit;
    }

    const [rows, count] = await this.prisma.$transaction([
      this.prisma.readingSession.findMany(findArgs),
      this.prisma.readingSession.count({ where }),
    ]);
    return {
      data: rows.map((row) => readingSessionToDomain(row)),
      count,
    };
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

  async markAttendance(id: number, role: 'huber' | 'reader'): Promise<void> {
    const now = new Date();
    // The null guard keeps the stamp atomic and makes a repeat call a no-op,
    // so the first join time is the one we keep.
    await this.prisma.readingSession.updateMany({
      where: {
        id,
        ...(role === 'huber'
          ? { huberJoinedAt: null }
          : { readerJoinedAt: null }),
      },
      data: role === 'huber' ? { huberJoinedAt: now } : { readerJoinedAt: now },
    });
  }
}
