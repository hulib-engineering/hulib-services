import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { StoryRepository } from '@stories/infrastructure/persistence/story.repository';
import { Story } from '@stories/domain/story';
import { PublishStatus } from '@stories/status.enum';
import {
  FilterStoryDto,
  SortStoryDto,
} from '@stories/dto/find-all-stories.dto';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { Topic } from '@topics/domain/topics';
import {
  storyInclude,
  StoryPrismaMapper,
  StoryWithRelations,
} from '../mappers/story-prisma.mapper';

// Owners of published stories must already be admin/humanBook; other
// statuses (e.g. pending) stay visible regardless of the owner's role, since
// a reader's first, still-unreviewed story is owned by a reader.
const PUBLISHED_LISTING_ROLE_IDS = [1, 2];

@Injectable()
export class PrismaStoriesRepository implements StoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Story> {
    const created = await this.prisma.story.create({
      data: {
        title: data.title,
        abstract: data.abstract,
        rejectionReason: data.rejectionReason,
        publishStatus:
          PublishStatus[data.publishStatus as keyof typeof PublishStatus],
        humanBook: { connect: { id: Number(data.humanBook.id) } },
        cover: data.cover?.id ? { connect: { id: data.cover.id } } : undefined,
        topics: data.topics?.length
          ? {
              create: data.topics.map((topic) => ({
                topic: { connect: { id: Number(topic.id) } },
              })),
            }
          : undefined,
      },
      include: storyInclude,
    });

    return StoryPrismaMapper.toDomain(created);
  }

  private buildWhere(filterOptions?: FilterStoryDto): Prisma.storyWhereInput {
    const where: Prisma.storyWhereInput = {};

    const restrictToPublishedRoles =
      filterOptions?.publishStatus === PublishStatus.published;

    if (filterOptions?.humanBookId) {
      where.humanBookId = Number(filterOptions.humanBookId);
    }

    if (restrictToPublishedRoles) {
      where.humanBook = { roleId: { in: PUBLISHED_LISTING_ROLE_IDS } };
    }

    if (filterOptions?.topicIds?.length) {
      where.topics = { some: { topicId: { in: filterOptions.topicIds } } };
    }

    if (filterOptions?.publishStatus) {
      where.publishStatus = filterOptions.publishStatus;
    }

    return where;
  }

  private buildOrderBy(
    sortOptions?: SortStoryDto[],
  ): Prisma.storyOrderByWithRelationInput[] | undefined {
    if (!sortOptions?.length) return undefined;

    return sortOptions.map((sort) => ({
      [sort.orderBy]: sort.order.toLowerCase() as Prisma.SortOrder,
    }));
  }

  // "favorite" isn't a real column, so it can't be pushed down to the
  // database as an ORDER BY. Instead: fetch the filtered set once, then run
  // a stable multi-key sort in memory (least significant key first, so the
  // final pass over the most significant key decides ties correctly) before
  // slicing the requested page.
  private sortByCriteria(
    entities: StoryWithRelations[],
    sortOptions: SortStoryDto[],
    favoriteStoryIds: Set<number>,
  ): StoryWithRelations[] {
    const sorted = [...entities];

    for (let i = sortOptions.length - 1; i >= 0; i--) {
      const sort = sortOptions[i];
      const direction = sort.order === 'ASC' ? 1 : -1;

      sorted.sort((a, b) => {
        const aValue =
          sort.orderBy === 'favorite'
            ? Number(favoriteStoryIds.has(a.id))
            : (a as unknown as Record<string, unknown>)[sort.orderBy];
        const bValue =
          sort.orderBy === 'favorite'
            ? Number(favoriteStoryIds.has(b.id))
            : (b as unknown as Record<string, unknown>)[sort.orderBy];

        if (aValue === bValue) return 0;
        return (aValue as never) > (bValue as never) ? direction : -direction;
      });
    }

    return sorted;
  }

  async findAllWithCountAndPagination({
    paginationOptions,
    filterOptions,
    sortOptions,
    currentUserId,
  }: {
    paginationOptions: IPaginationOptions;
    filterOptions?: FilterStoryDto;
    sortOptions?: SortStoryDto[];
    currentUserId?: number;
  }): Promise<{ data: Story[]; count: number }> {
    const where = this.buildWhere(filterOptions);
    const skip = (paginationOptions.page - 1) * paginationOptions.limit;
    const take = paginationOptions.limit;
    const hasFavoriteSort = sortOptions?.some(
      (sort) => sort.orderBy === 'favorite',
    );

    if (hasFavoriteSort && currentUserId) {
      const [entities, favorites] = await Promise.all([
        this.prisma.story.findMany({ where, include: storyInclude }),
        this.prisma.storyFavorite.findMany({
          where: { userId: currentUserId },
          select: { storyId: true },
        }),
      ]);

      const favoriteStoryIds = new Set(favorites.map((f) => f.storyId));
      const sorted = this.sortByCriteria(
        entities,
        sortOptions ?? [],
        favoriteStoryIds,
      );
      const page = sorted.slice(skip, skip + take);

      return {
        data: page.map((entity) => StoryPrismaMapper.toDomain(entity)),
        count: entities.length,
      };
    }

    const [entities, count] = await Promise.all([
      this.prisma.story.findMany({
        where,
        skip,
        take,
        orderBy: this.buildOrderBy(sortOptions),
        include: storyInclude,
      }),
      this.prisma.story.count({ where }),
    ]);

    return {
      data: entities.map((entity) => StoryPrismaMapper.toDomain(entity)),
      count,
    };
  }

  async findMostPopularWithCountAndPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<{ data: Story[]; count: number }> {
    const publishedStories = await this.prisma.story.findMany({
      where: { publishStatus: PublishStatus.published },
      select: { id: true, _count: { select: { readingSession: true } } },
    });

    const orderedIds = [...publishedStories]
      .sort((a, b) => b._count.readingSession - a._count.readingSession)
      .map((story) => story.id);

    const start = (paginationOptions.page - 1) * paginationOptions.limit;
    const pageIds = orderedIds.slice(start, start + paginationOptions.limit);

    if (!pageIds.length) {
      return { data: [], count: orderedIds.length };
    }

    const entities = await this.prisma.story.findMany({
      where: { id: { in: pageIds } },
      include: storyInclude,
    });

    const entityById = new Map(entities.map((entity) => [entity.id, entity]));

    return {
      data: pageIds.map((id) =>
        StoryPrismaMapper.toDomain(entityById.get(id)!),
      ),
      count: orderedIds.length,
    };
  }

  async findById(id: Story['id']): Promise<NullableType<Story>> {
    const entity = await this.prisma.story.findUnique({
      where: { id: Number(id) },
      include: storyInclude,
    });

    return entity ? StoryPrismaMapper.toDomain(entity) : null;
  }

  async findRelatedTopics(id: Story['id']): Promise<Topic[]> {
    const story = await this.prisma.story.findUnique({
      where: { id: Number(id) },
      select: { topics: { include: { topic: true } } },
    });

    return (
      story?.topics.map((storyTopic) =>
        StoryPrismaMapper.toDomainTopic(storyTopic.topic),
      ) ?? []
    );
  }

  async update(id: Story['id'], payload: Partial<Story>): Promise<Story> {
    const data: Prisma.storyUpdateInput = {};

    if (payload.title !== undefined) data.title = payload.title;
    if (payload.abstract !== undefined) data.abstract = payload.abstract;
    if (payload.rejectionReason !== undefined) {
      data.rejectionReason = payload.rejectionReason;
    }
    if (payload.publishStatus !== undefined) {
      data.publishStatus =
        PublishStatus[payload.publishStatus as keyof typeof PublishStatus];
    }
    if (payload.cover !== undefined) {
      data.cover = payload.cover
        ? { connect: { id: payload.cover.id } }
        : { disconnect: true };
    }
    if (payload.humanBook?.id) {
      data.humanBook = { connect: { id: Number(payload.humanBook.id) } };
    }
    if (payload.topics !== undefined) {
      data.topics = {
        deleteMany: {},
        create: (payload.topics ?? []).map((topic) => ({
          topic: { connect: { id: topic.id } },
        })),
      };
    }

    try {
      const updated = await this.prisma.story.update({
        where: { id: Number(id) },
        data,
        include: storyInclude,
      });

      return StoryPrismaMapper.toDomain(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new Error('Record not found');
      }
      throw error;
    }
  }

  async remove(id: Story['id']): Promise<void> {
    await this.prisma.story.delete({ where: { id: Number(id) } });
  }
}
