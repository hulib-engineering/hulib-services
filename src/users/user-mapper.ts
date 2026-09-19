import { Prisma } from '@prisma/client';
import { User } from '@users/domain/user';
import { Topics } from '@topics/domain/topics';
import { TopicColor } from '@topics/topic-color.enum';
import { TopicStatus } from '@topics/topic-status.enum';
import { GenderEnum } from '@genders/genders.enum';
import { RoleEnum } from '@roles/roles.enum';
import { StatusEnum } from '@statuses/statuses.enum';

export const basicUserInclude = {
  include: {
    file: true,
    humanBookTopic: { include: { topic: true } },
  },
} satisfies Prisma.userDefaultArgs;

export type BasicUserRecord = Prisma.userGetPayload<typeof basicUserInclude>;

export class UserMapperImplement {
  static toDomain(raw: BasicUserRecord): User {
    const domainEntity = new User();

    domainEntity.id = raw.id;
    domainEntity.email = raw.email;
    domainEntity.password = raw.password ?? undefined;
    // Mirrors the TypeORM entity's @AfterLoad hook: callers (notably
    // auth.service.ts) round-trip a freshly-loaded user back through
    // update() and rely on previousPassword === password to skip re-hashing
    // an already-hashed password.
    domainEntity.previousPassword = raw.password ?? undefined;
    domainEntity.provider = raw.provider;
    domainEntity.socialId = raw.socialId;
    domainEntity.fullName = raw.fullName;
    domainEntity.birthday = raw.birthday;

    if (raw.file) {
      domainEntity.photo = { id: raw.file.id, path: raw.file.path };
    }

    // `gender`/`role`/`status` used to be Prisma relations to their own
    // lookup tables (dropped — see prisma/schema.prisma); the enum is the
    // real source of truth for id->name, so synthesize the {id, name} shape
    // from the scalar id columns instead of an include.
    domainEntity.gender =
      raw.genderId != null
        ? { id: raw.genderId, name: GenderEnum[raw.genderId] }
        : undefined;
    domainEntity.role =
      raw.roleId != null
        ? { id: raw.roleId, name: RoleEnum[raw.roleId] }
        : undefined;
    domainEntity.status =
      raw.statusId != null
        ? { id: raw.statusId, name: StatusEnum[raw.statusId] }
        : undefined;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.address = raw.address;
    domainEntity.phoneNumber = raw.phoneNumber;
    domainEntity.parentPhoneNumber = raw.parentPhoneNumber;
    domainEntity.bio = raw.bio;
    domainEntity.videoUrl = raw.videoUrl;
    domainEntity.warnCount = raw.warnCount ?? 0;
    domainEntity.huberSince = raw.huberSince ?? null;
    domainEntity.hasSeenHuberOnboarding = raw.hasSeenHuberOnboarding ?? false;
    domainEntity.approval = raw.approval;

    const topics: Topics[] | undefined = raw.humanBookTopic?.map((entry) => {
      const topic = new Topics();
      topic.id = entry.topic.id;
      topic.name = entry.topic.name;
      topic.color = entry.topic.color as unknown as TopicColor;
      topic.status = entry.topic.status as unknown as TopicStatus;
      topic.createdAt = entry.topic.createdAt;
      topic.updatedAt = entry.topic.updatedAt;
      return topic;
    });
    domainEntity.topics = topics;
    domainEntity.countTopics = topics?.length ?? 0;

    return domainEntity;
  }
}