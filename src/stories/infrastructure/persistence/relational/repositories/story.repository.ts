import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';

import { StoryEntity } from '@stories/infrastructure/persistence/relational/entities/story.entity';
import { Story } from '@stories/domain/story';
import { StoryRepository } from '@stories/infrastructure/persistence/story.repository';
import { StoryMapper } from '@stories/infrastructure/persistence/relational/mappers/story.mapper';
import {
  FilterStoryDto,
  SortStoryDto,
} from '@stories/dto/find-all-stories.dto';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { Topic } from '@topics/domain/topics';
import { PublishStatus } from '@stories/status.enum';

@Injectable()
export class StoriesRelationalRepository implements StoryRepository {
  constructor(
    @InjectRepository(StoryEntity)
    private readonly storiesRepository: Repository<StoryEntity>,
  ) {}

  async create(data: Story): Promise<Story> {
    const persistenceModel = StoryMapper.toPersistence(data);
    const newEntity = await this.storiesRepository.save(
      this.storiesRepository.create(persistenceModel),
    );
    return StoryMapper.toDomain(newEntity);
  }

  private buildWhere(
    filterOptions?: FilterStoryDto,
  ): FindOptionsWhere<StoryEntity> {
    const where: FindOptionsWhere<StoryEntity> = {};

    if (filterOptions?.humanBookId) {
      where.humanBook = {
        id: Number(filterOptions.humanBookId),
        role: {
          id: In([1, 2]),
        },
      };
    } else {
      where.humanBook = {
        role: {
          id: In([1, 2]),
        },
      };
    }

    if (filterOptions?.topicIds?.length) {
      where.topics = filterOptions.topicIds.map((id) => ({ id }));
    }

    if (filterOptions?.publishStatus) {
      where.publishStatus = filterOptions.publishStatus;
    }

    return where;
  }

  async findAllWithPagination({
    paginationOptions,
    filterOptions,
    sortOptions,
    currentUserId,
  }: {
    paginationOptions: IPaginationOptions;
    filterOptions?: FilterStoryDto;
    sortOptions?: SortStoryDto[];
    currentUserId?: number;
  }): Promise<Story[]> {
    const hasFavoriteSort = sortOptions?.some(
      (sort) => sort.orderBy === 'favorite',
    );

    if (hasFavoriteSort && currentUserId) {
      const queryBuilder = this.storiesRepository
        .createQueryBuilder('story')
        .leftJoinAndSelect('story.topics', 'topics')
        .leftJoinAndSelect('story.cover', 'cover')
        .leftJoinAndSelect('story.humanBook', 'humanBook')
        .leftJoin(
          'storyFavorite',
          'favorite',
          'favorite."storyId" = story.id AND favorite."userId" = :userId',
          { userId: currentUserId },
        )
        .addSelect(
          'CASE WHEN favorite."userId" IS NOT NULL THEN 1 ELSE 0 END',
          'is_favorite',
        );

      if (filterOptions?.humanBookId) {
        queryBuilder.andWhere('story.humanBookId = :humanBookId', {
          humanBookId: filterOptions.humanBookId,
        });
      }

      if (filterOptions?.topicIds && filterOptions.topicIds.length) {
        queryBuilder.andWhere('topics.id IN (:...topicIds)', {
          topicIds: filterOptions.topicIds,
        });
      }

      if (filterOptions?.publishStatus) {
        queryBuilder.andWhere('story.publishStatus = :publishStatus', {
          publishStatus: filterOptions.publishStatus,
        });
      }

      let isFirstSort = true;
      sortOptions?.forEach((sort) => {
        if (sort.orderBy === 'favorite') {
          if (isFirstSort) {
            queryBuilder.orderBy('is_favorite', sort.order);
            isFirstSort = false;
          } else {
            queryBuilder.addOrderBy('is_favorite', sort.order);
          }
        } else {
          const columnName = `story.${sort.orderBy}`;
          if (isFirstSort) {
            queryBuilder.orderBy(columnName, sort.order);
            isFirstSort = false;
          } else {
            queryBuilder.addOrderBy(columnName, sort.order);
          }
        }
      });

      queryBuilder
        .skip((paginationOptions.page - 1) * paginationOptions.limit)
        .take(paginationOptions.limit);

      const entities = await queryBuilder.getMany();
      return entities.map((entity) => StoryMapper.toDomain(entity));
    } else {
      const where: FindOptionsWhere<StoryEntity> = {};
      if (!!filterOptions?.humanBookId) {
        where.humanBook = { id: Number(filterOptions?.humanBookId) };
      }

      if (!!filterOptions?.topicIds && filterOptions?.topicIds.length) {
        where.topics = filterOptions.topicIds.map((topicId) => ({
          id: topicId,
        }));
      }

      if (!!filterOptions?.publishStatus) {
        where.publishStatus = filterOptions.publishStatus;
      }

      const entities = await this.storiesRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where,
        relations: {
          topics: true,
          cover: true,
          humanBook: {
            role: true,
          },
        },
        order: sortOptions?.reduce(
          (accumulator, sort) => ({
            ...accumulator,
            [sort.orderBy]: sort.order,
          }),
          {},
        ),
      });

      return entities.map((entity) => StoryMapper.toDomain(entity));
    }
  }

  async findAllWithCountAndPagination({
    paginationOptions,
    filterOptions,
    // sortOptions,
  }: {
    paginationOptions: IPaginationOptions;
    filterOptions?: FilterStoryDto;
    sortOptions?: SortStoryDto[];
  }): Promise<{ data: Story[]; count: number }> {
    const [entities, total] = await this.storiesRepository.findAndCount({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: this.buildWhere(filterOptions),
      relations: {
        topics: true,
        cover: true,
        humanBook: {
          role: true,
        },
      },
      // order: sortOptions?.reduce(
      //   (accumulator, sort) => ({
      //     ...accumulator,
      //     [sort.orderBy]: sort.order,
      //   }),
      //   {},
      // ),
    });

    return {
      data: entities.map((entity) => StoryMapper.toDomain(entity)),
      count: total,
    };
  }

  async findMostPopularWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Story[]> {
    const rawCounts = await this.storiesRepository
      .createQueryBuilder('story')
      .leftJoin('story.readingSessions', 'rs')
      .where('story.publishStatus = :status', {
        status: PublishStatus.published,
      })
      .select('story.id', 'storyId')
      .addSelect('COUNT(rs.id)::int', 'readingSessionsCount') // ✅ cast to integer
      .groupBy('story.id')
      .orderBy('"readingSessionsCount"', 'DESC')
      .getRawMany();

    // Manual pagination
    const start = (paginationOptions.page - 1) * paginationOptions.limit;
    const end = start + paginationOptions.limit;
    const pagedCounts = rawCounts.slice(start, end);

    const storyIds = pagedCounts.map((r) => r.storyId);
    if (!storyIds.length) return [];

    const entities = await this.storiesRepository.find({
      where: { id: In(storyIds) },
      relations: {
        topics: true,
        cover: true,
        humanBook: true,
      },
    });

    // Optional: preserve the readingSessionsCount for client use
    const entitiesMap = new Map(entities.map((e) => [e.id, e]));
    return storyIds.map((id) => StoryMapper.toDomain(entitiesMap.get(id)!));
  }

  async findById(id: Story['id']): Promise<NullableType<Story>> {
    const entity = await this.storiesRepository.findOne({
      where: { id },
    });

    return entity ? StoryMapper.toDomain(entity) : null;
  }

  async findRelatedTopics(id: Story['id']): Promise<Topic[]> {
    const story = await this.storiesRepository.findOne({
      where: { id },
      relations: ['topics'],
    });
    return story?.topics ?? [];
  }

  async update(id: Story['id'], payload: Partial<Story>): Promise<Story> {
    const entity = await this.storiesRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.storiesRepository.save(
      this.storiesRepository.create(
        StoryMapper.toPersistence({
          ...StoryMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return StoryMapper.toDomain(updatedEntity);
  }

  async remove(id: Story['id']): Promise<void> {
    await this.storiesRepository.delete(id);
  }
}
