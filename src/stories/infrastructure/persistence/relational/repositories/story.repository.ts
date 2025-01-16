import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoryEntity } from '../entities/story.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Story } from '../../../../domain/story';
import { StoryRepository } from '../../story.repository';
import { StoryMapper } from '../mappers/story.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

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
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Story[]> {
    const entities = await this.storiesRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => StoryMapper.toDomain(entity));
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
