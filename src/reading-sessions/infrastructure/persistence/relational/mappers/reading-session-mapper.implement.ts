import { Prisma } from '@prisma/client';
import { ReadingSession, ReadingSessionStatus } from '@reading-sessions/domain';
import { Story } from '@stories/domain/story';
import { PublishStatus } from '@stories/status.enum';
import {
  basicUserInclude,
  UserMapperImplement,
} from '@users/infrastructure/persistence/relational/mappers/user-mapper.implement';
import { MessageMapperImplement } from './message-mapper.implement';

export const readingSessionInclude = {
  include: {
    humanBook: basicUserInclude,
    reader: basicUserInclude,
    story: true,
    messages: true,
  },
} satisfies Prisma.readingSessionDefaultArgs;

export type ReadingSessionRecord = Prisma.readingSessionGetPayload<
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

export class ReadingSessionMapperImplement {
  static toDomain(raw: ReadingSessionRow): ReadingSession {
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
      domain.messages = raw.messages.map((message) =>
        MessageMapperImplement.toDomain(message),
      );
    }

    return domain;
  }
}
