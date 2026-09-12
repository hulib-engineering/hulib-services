import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { DeepPartial } from '@utils/types/deep-partial.type';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { User } from '@users/domain/user';
import {
  FilterUserDto,
  QueryUserDto,
  SortUserDto,
} from '@users/dto/query-user.dto';
import { RoleEnum } from '@roles/roles.enum';
import { Approval } from '@users/approval.enum';

import { UserRepository } from '@users/infrastructure/persistence/user.repository';
import {
  basicUserInclude,
  UserMapperImplement,
} from '@users/infrastructure/persistence/relational/mappers/user-mapper.implement';

// findByEmail/findBySocialIdAndProvider intentionally don't load humanBookTopic
// (sharingTopics). Auth flows round-trip the whole domain User returned by
// these two straight back through update() (see auth.service.ts), and
// update() replaces a user's sharingTopics whenever `topics` is present on
// the payload — loading it here would make those unrelated auth round-trips
// silently wipe the user's sharing topics.
const basicUserIncludeNoTopics = {
  include: {
    file: true,
  },
} satisfies Prisma.userDefaultArgs;

// SortUserDto.orderBy is only validated as a string, and several User
// fields (role/status/gender/photo/topics) aren't plain columns — so sort
// keys are whitelisted here rather than interpolated, both to avoid Prisma
// runtime errors on relation fields and to keep the sort key off the SQL
// surface entirely.
const sortableColumns: Partial<
  Record<keyof User, keyof Prisma.userOrderByWithRelationInput>
> = {
  id: 'id',
  email: 'email',
  fullName: 'fullName',
  provider: 'provider',
  socialId: 'socialId',
  birthday: 'birthday',
  address: 'address',
  phoneNumber: 'phoneNumber',
  parentPhoneNumber: 'parentPhoneNumber',
  bio: 'bio',
  videoUrl: 'videoUrl',
  warnCount: 'warnCount',
  huberSince: 'huberSince',
  approval: 'approval',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

@Injectable()
export class UserRepositoryImplement implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<User, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        provider: data.provider,
        socialId: data.socialId,
        fullName: data.fullName,
        birthday: data.birthday,
        address: data.address,
        phoneNumber: data.phoneNumber,
        parentPhoneNumber: data.parentPhoneNumber,
        bio: data.bio,
        videoUrl: data.videoUrl,
        warnCount: data.warnCount ?? 0,
        huberSince: data.huberSince ?? null,
        hasSeenHuberOnboarding: data.hasSeenHuberOnboarding ?? false,
        approval: data.approval ?? null,
        genderId: data.gender?.id != null ? Number(data.gender.id) : undefined,
        roleId: data.role?.id != null ? Number(data.role.id) : undefined,
        statusId: data.status?.id != null ? Number(data.status.id) : undefined,
        photoId: data.photo?.id ?? undefined,
      },
      ...basicUserInclude,
    });

    return UserMapperImplement.toDomain(created);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: (FilterUserDto & Pick<QueryUserDto, 'role'>) | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<{ data: User[]; count: number }> {
    const where: Prisma.userWhereInput = { deletedAt: null };

    if (filterOptions?.role) {
      where.roleId =
        filterOptions.role === 'huber' ? RoleEnum.humanBook : RoleEnum.reader;
    }

    if (filterOptions?.topicsOfInterest?.length) {
      where.humanBookTopic = {
        some: { topicId: { in: filterOptions.topicsOfInterest } },
      };
    }

    const orderBy: Prisma.userOrderByWithRelationInput[] = [];
    for (const sort of sortOptions ?? []) {
      const column = sortableColumns[sort.orderBy];
      if (column) {
        orderBy.push({
          [column]: sort.order.toLowerCase() === 'desc' ? 'desc' : 'asc',
        });
      }
    }
    if (orderBy.length === 0) {
      orderBy.push({ id: 'asc' });
    }

    const skip = (paginationOptions.page - 1) * paginationOptions.limit;
    const take = paginationOptions.limit;

    // Prisma's orderBy can't express the original TypeORM query's
    // "CASE WHEN approval = 'Pending' THEN 0 ELSE 1 END" priority sort, so it
    // is emulated by paginating across two ordered groups (pending first,
    // everything else second) and concatenating — equivalent to a single
    // ORDER BY on that CASE expression as the primary sort key.
    const pendingWhere: Prisma.userWhereInput = {
      ...where,
      approval: Approval.pending,
    };
    const restWhere: Prisma.userWhereInput = {
      ...where,
      OR: [{ approval: { not: Approval.pending } }, { approval: null }],
    };

    const [pendingCount, totalCount] = await Promise.all([
      this.prisma.user.count({ where: pendingWhere }),
      this.prisma.user.count({ where }),
    ]);

    const pendingSkip = Math.min(skip, pendingCount);
    const pendingTake = Math.max(0, Math.min(take, pendingCount - skip));
    const restSkip = Math.max(0, skip - pendingCount);
    const restTake = take - pendingTake;

    const [pendingRows, restRows] = await Promise.all([
      pendingTake > 0
        ? this.prisma.user.findMany({
            where: pendingWhere,
            orderBy,
            skip: pendingSkip,
            take: pendingTake,
            ...basicUserInclude,
          })
        : Promise.resolve([]),
      restTake > 0
        ? this.prisma.user.findMany({
            where: restWhere,
            orderBy,
            skip: restSkip,
            take: restTake,
            ...basicUserInclude,
          })
        : Promise.resolve([]),
    ]);

    const data = [...pendingRows, ...restRows].map((row) =>
      UserMapperImplement.toDomain(row),
    );

    return { data, count: totalCount };
  }

  async findById(id: User['id']): Promise<NullableType<User>> {
    const found = await this.prisma.user.findFirst({
      where: { id: Number(id), deletedAt: null },
      ...basicUserInclude,
    });

    return found ? UserMapperImplement.toDomain(found) : null;
  }

  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    if (!email) return null;

    const found = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      ...basicUserIncludeNoTopics,
    });

    return found ? UserMapperImplement.toDomain(found as any) : null;
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    if (!socialId || !provider) return null;

    const found = await this.prisma.user.findFirst({
      where: { socialId, provider, deletedAt: null },
      ...basicUserIncludeNoTopics,
    });

    return found ? UserMapperImplement.toDomain(found as any) : null;
  }

  async update(id: User['id'], payload: DeepPartial<User>): Promise<User> {
    const userId = Number(id);
    const exists = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });
    if (!exists) {
      throw new Error('User not found');
    }

    const data: Prisma.userUncheckedUpdateInput = {};
    if ('email' in payload) data.email = payload.email;
    if ('password' in payload) data.password = payload.password;
    if ('provider' in payload) data.provider = payload.provider;
    if ('socialId' in payload) data.socialId = payload.socialId;
    if ('fullName' in payload) data.fullName = payload.fullName;
    if ('birthday' in payload) data.birthday = payload.birthday;
    if ('address' in payload) data.address = payload.address;
    if ('phoneNumber' in payload) data.phoneNumber = payload.phoneNumber;
    if ('parentPhoneNumber' in payload)
      data.parentPhoneNumber = payload.parentPhoneNumber;
    if ('bio' in payload) data.bio = payload.bio;
    if ('videoUrl' in payload) data.videoUrl = payload.videoUrl;
    if ('warnCount' in payload) data.warnCount = payload.warnCount;
    if ('huberSince' in payload)
      data.huberSince = payload.huberSince as Date | null | undefined;
    if ('hasSeenHuberOnboarding' in payload)
      data.hasSeenHuberOnboarding = payload.hasSeenHuberOnboarding;
    if ('approval' in payload) data.approval = payload.approval;
    if ('gender' in payload) {
      data.genderId =
        payload.gender?.id != null ? Number(payload.gender.id) : null;
    }
    if ('role' in payload) {
      data.roleId = payload.role?.id != null ? Number(payload.role.id) : null;
    }
    if ('status' in payload) {
      data.statusId =
        payload.status?.id != null ? Number(payload.status.id) : null;
    }
    if ('photo' in payload) {
      data.photoId = payload.photo?.id ?? null;
    }
    if ('coverImage' in payload) {
      data.coverImageId = payload.coverImage?.id ?? null;
    }

    const operations: Prisma.PrismaPromise<unknown>[] = [
      this.prisma.user.update({ where: { id: userId }, data }),
    ];

    // Mirrors the TypeORM @JoinTable cascade: assigning `.topics` used to
    // replace the humanBookTopic join rows outright (this is how the
    // "become a huber" onboarding flow sets sharing topics via
    // usersService.update — see auth.controller.ts's createHumanBooks route).
    if (payload.topics) {
      const topicIds = payload.topics
        .map((topic) => Number(topic?.id))
        .filter((topicId) => Number.isFinite(topicId));

      operations.push(
        this.prisma.humanBookTopic.deleteMany({ where: { userId } }),
      );
      if (topicIds.length > 0) {
        operations.push(
          this.prisma.humanBookTopic.createMany({
            data: topicIds.map((topicId) => ({ userId, topicId })),
            skipDuplicates: true,
          }),
        );
      }
    }

    await this.prisma.$transaction(operations);

    const updated = await this.prisma.user.findFirstOrThrow({
      where: { id: userId },
      ...basicUserInclude,
    });
    return UserMapperImplement.toDomain(updated);
  }

  async remove(id: User['id']): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });
  }

  async findHumanBookById(id: User['id']): Promise<NullableType<User>> {
    const found = await this.prisma.user.findFirst({
      where: { id: Number(id), roleId: RoleEnum.humanBook, deletedAt: null },
      ...basicUserInclude,
    });

    return found ? UserMapperImplement.toDomain(found) : null;
  }
}
