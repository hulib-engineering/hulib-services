import { Prisma } from '@prisma/client';

import { Story } from '@stories/domain/story';
import { PublishStatus } from '@stories/status.enum';
import { Topic } from '@topics/domain/topics';
import { TopicColor } from '@topics/topic-color.enum';
import { TopicStatus } from '@topics/topic-status.enum';
import { FileType } from '@files/domain/file';
import { User } from '@users/domain/user';
import { Role } from '@roles/domain/role';
import { Status } from '@statuses/domain/status';

// Password (and a few other internal-only columns) are never fetched for
// humanBook, so they can never leak through this mapper regardless of how
// the response gets serialized downstream.
export const storyInclude = {
  cover: true,
  humanBook: {
    omit: {
      password: true,
      deletedAt: true,
      genderId: true,
      roleId: true,
      statusId: true,
      photoId: true,
    },
    include: {
      role: true,
      status: true,
      file: true,
    },
  },
  topics: {
    include: {
      topic: true,
    },
  },
} satisfies Prisma.storyInclude;

export type StoryWithRelations = Prisma.storyGetPayload<{
  include: typeof storyInclude;
}>;

type HumanBookWithRelations = StoryWithRelations['humanBook'];
type TopicRow = StoryWithRelations['topics'][number]['topic'];

export class StoryPrismaMapper {
  static toDomainFile(
    raw?: { id: string; path: string } | null,
  ): FileType | null {
    if (!raw) return null;

    const file = new FileType();
    file.id = raw.id;
    file.path = raw.path;
    return file;
  }

  static toDomainTopic(raw: TopicRow): Topic {
    const topic = new Topic();
    topic.id = raw.id;
    topic.name = raw.name;
    topic.color = raw.color as unknown as TopicColor;
    topic.status = raw.status as unknown as TopicStatus;
    topic.createdAt = raw.createdAt;
    topic.updatedAt = raw.updatedAt;
    return topic;
  }

  static toDomainUser(raw: HumanBookWithRelations): User {
    const user = new User();
    user.id = raw.id;
    user.email = raw.email;
    user.provider = raw.provider;
    user.socialId = raw.socialId;
    user.fullName = raw.fullName;
    user.birthday = raw.birthday;
    user.address = raw.address;
    user.phoneNumber = raw.phoneNumber;
    user.parentPhoneNumber = raw.parentPhoneNumber;
    user.bio = raw.bio;
    user.videoUrl = raw.videoUrl;
    user.warnCount = raw.warnCount ?? 0;
    user.huberSince = raw.huberSince ?? null;
    user.hasSeenHuberOnboarding = raw.hasSeenHuberOnboarding ?? false;
    user.approval = raw.approval;
    user.createdAt = raw.createdAt;
    user.updatedAt = raw.updatedAt;

    if (raw.role) {
      const role = new Role();
      role.id = raw.role.id;
      role.name = raw.role.name;
      user.role = role;
    }

    if (raw.status) {
      const status = new Status();
      status.id = raw.status.id;
      status.name = raw.status.name;
      user.status = status;
    }

    user.photo = this.toDomainFile(raw.file);

    return user;
  }

  static toDomain(raw: StoryWithRelations): Story {
    const story = new Story();
    story.id = raw.id;
    story.title = raw.title;
    story.abstract = raw.abstract;
    story.cover = this.toDomainFile(raw.cover);
    story.humanBook = this.toDomainUser(raw.humanBook);
    story.topics = raw.topics.map((storyTopic) =>
      this.toDomainTopic(storyTopic.topic),
    );
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
}
