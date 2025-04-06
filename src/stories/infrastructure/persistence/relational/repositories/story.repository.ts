import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
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
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class StoriesRelationalRepository implements StoryRepository {
  constructor(
    @InjectRepository(StoryEntity)
    private readonly storiesRepository: Repository<StoryEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(data: Story): Promise<Story> {
    const persistenceModel = StoryMapper.toPersistence(data);

    const newEntity = await this.storiesRepository
      .createQueryBuilder()
      .insert()
      .into(StoryEntity)
      .values(persistenceModel)
      .execute()
      .then(async (result) => {
        const story = await this.storiesRepository.findOne({
          where: { id: result.identifiers[0].id },
          relations: ['topics', 'humanBook'],
        });

        if (!story) {
          throw new Error('Story not found');
        }

        if (data.topics?.length) {
          await this.storiesRepository
            .createQueryBuilder()
            .relation(StoryEntity, 'topics')
            .of(story)
            .add(data.topics.map((topic) => topic.id));
        }

        return this.storiesRepository.findOneOrFail({
          where: { id: story.id },
          relations: ['topics', 'humanBook'],
        });
      });

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
      // relations: ['humanBook', 'topics', 'humanBook.topics'],
      relations: {
        topics: true,
      },
    });

    const humanbookSearch = await this.userRepository.find({
      where: {
        id: In(
          entities
            .map((entity) => entity.humanBook?.id)
            .filter((id): id is number => id !== undefined),
        ),
      },
      relations: {
        topics: true,
      },
    });

    const stories = entities.map((entity) => StoryMapper.toDomain(entity));

    // add field countTopics to story
    stories.forEach((story) => {
      const countTopics = humanbookSearch.reduce(
        (acc, user) => acc + (user.topics?.length || 0),
        0,
      );
      story.humanBook.countTopics = countTopics;
    });

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
