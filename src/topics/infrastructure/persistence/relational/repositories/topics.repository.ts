import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { TopicsEntity } from '@topics/infrastructure/persistence/relational/entities/topics.entity';
import { NullableType } from '@utils/types/nullable.type';
import { Topics } from '@topics/domain/topics';
import { TopicsRepository } from '@topics/infrastructure/persistence/topics.repository';
import { TopicsMapper } from '@topics/infrastructure/persistence/relational/mappers/topics.mapper';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { PublishStatus } from '@stories/status.enum';
import { TopicStatus } from '@topics/topic-status.enum';

@Injectable()
export class TopicsRelationalRepository implements TopicsRepository {
  constructor(
    @InjectRepository(TopicsEntity)
    private readonly topicsRepository: Repository<TopicsEntity>,
  ) {}

  async create(data: Topics): Promise<Topics> {
    const persistenceModel = TopicsMapper.toPersistence(data);
    const newEntity = await this.topicsRepository.save(
      this.topicsRepository.create(persistenceModel),
    );
    return TopicsMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
    name,
    status,
  }: {
    paginationOptions: IPaginationOptions;
    name?: string;
    status?: Topics['status'];
  }): Promise<{ data: Topics[]; total: number }> {
    const where: FindOptionsWhere<TopicsEntity> = {};

    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (status) {
      where.status = status;
    }

    const [entities, total] = await Promise.all([
      this.topicsRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where,
      }),
      this.topicsRepository.count({ where }),
    ]);

    return {
      data: entities.map((entity) => TopicsMapper.toDomain(entity)),
      total,
    };
  }

  async findTop3PopularTopics(): Promise<Topics[]> {
    const queryBuilder = this.topicsRepository
      .createQueryBuilder('topic')
      .leftJoin('topic.stories', 'story') // join through storyTopic
      .leftJoin('story.readingSessions', 'rs') // join reading sessions
      .where('topic.status = :topicStatus', {
        topicStatus: TopicStatus.active,
      })
      .andWhere('story.publishStatus = :status', {
        status: PublishStatus.published,
      })
      .select('topic.id', 'id')
      .addSelect('COUNT(rs.id)', 'totalBookings')
      .groupBy('topic.id')
      .orderBy('COUNT(rs.id)', 'DESC') // use the full expression to be safe
      .limit(3);

    const rawTopics = await queryBuilder.getRawMany();

    const topicIds: number[] = rawTopics
      .map((r) => Number(r.id))
      .filter(Boolean);
    if (!topicIds.length) {
      return [];
    }

    return this.findByIds(topicIds);
  }

  async findById(id: Topics['id']): Promise<NullableType<Topics>> {
    const entity = await this.topicsRepository.findOne({
      where: { id },
    });

    return entity ? TopicsMapper.toDomain(entity) : null;
  }

  async findByName(
    name: string,
    excludeId?: Topics['id'],
  ): Promise<NullableType<Topics>> {
    const trimmedName = name.trim();
    const queryBuilder = this.topicsRepository
      .createQueryBuilder('topic')
      .where('LOWER(topic.name) = LOWER(:name)', { name: trimmedName });

    if (excludeId !== undefined) {
      queryBuilder.andWhere('topic.id != :excludeId', { excludeId });
    }

    const entity = await queryBuilder.getOne();
    return entity ? TopicsMapper.toDomain(entity) : null;
  }

  async update(id: Topics['id'], payload: Partial<Topics>): Promise<Topics> {
    const entity = await this.topicsRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.topicsRepository.save(
      this.topicsRepository.create(
        TopicsMapper.toPersistence({
          ...TopicsMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return TopicsMapper.toDomain(updatedEntity);
  }

  async remove(id: Topics['id']): Promise<void> {
    await this.topicsRepository.delete(id);
  }

  async findByIds(ids: Topics['id'][]): Promise<Topics[]> {
    const entities = await this.topicsRepository.find({
      where: { id: In(ids) },
    });
    return entities.map((entity) => TopicsMapper.toDomain(entity));
  }
}
