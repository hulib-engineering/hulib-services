import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { StoryEntity } from '@stories/infrastructure/persistence/relational/entities/story.entity';
import { NullableType } from '@utils/types/nullable.type';
import { Story } from '@stories/domain/story';
import { StoryRepository } from '@stories/infrastructure/persistence/story.repository';
import { StoryMapper } from '@stories/infrastructure/persistence/relational/mappers/story.mapper';
import { IPaginationOptions } from '@utils/types/pagination-options';
import {
  FilterStoryDto,
  SortStoryDto,
} from '@stories/dto/find-all-stories.dto';

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

  async findAllWithPagination({
    paginationOptions,
    filterOptions,
    sortOptions,
  }: {
    paginationOptions: IPaginationOptions;
    filterOptions?: FilterStoryDto | null;
    sortOptions?: SortStoryDto[] | null;
  }): Promise<Story[]> {
    const where: FindOptionsWhere<StoryEntity> = {};
    if (filterOptions?.humanBookId) {
      where.humanBook = { id: Number(filterOptions?.humanBookId) };
    }

    if (filterOptions?.topicIds?.length) {
      where.topics = filterOptions.topicIds.map((topicId) => ({
        id: topicId,
      }));
    }

    const entities = await this.storiesRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where,
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        {},
      ),
      relations: {
        topics: true,
      },
    });

    const stories = entities.map((entity) => StoryMapper.toDomain(entity));
    return stories;
  }

  async findById(id: Story['id']): Promise<NullableType<Story>> {
    const entity = await this.storiesRepository.findOne({
      where: { id },
    });

    return entity ? StoryMapper.toDomain(entity) : null;
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
