import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { FeedbackEntity } from '../entities/feedback.entity';
import { Feedback } from '../../../../domain/feedback';
import { FeedbackMapper } from '../mappers/feedbacks.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class FeedbackRepository {
  constructor(
    @InjectRepository(FeedbackEntity)
    private readonly repository: Repository<FeedbackEntity>,
  ) {}

  async create(domain: Feedback): Promise<Feedback> {
    const entity = FeedbackMapper.toPersistence(domain);
    const newEntity = await this.repository.save(entity);
    return FeedbackMapper.toDomain(newEntity);
  }

  async findById(id: number): Promise<Feedback | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['readingSession'],
    });
    return entity ? FeedbackMapper.toDomain(entity) : null;
  }

  async findByReadingSessionId(readingSessionId: number): Promise<Feedback[]> {
    const entities = await this.repository.find({
      where: { readingSessionId },
      relations: ['readingSession'],
    });
    return entities.map((entity) => FeedbackMapper.toDomain(entity));
  }

  async findManyWithPagination({
    paginationOptions,
  }: {
    filterOptions?: any;
    paginationOptions: IPaginationOptions;
  }): Promise<Feedback[]> {
    const where: FindOptionsWhere<FeedbackEntity> = {};

    const entities = await this.repository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      relations: ['readingSession'],
    });

    return entities.map((entity) => FeedbackMapper.toDomain(entity));
  }

  async update(id: number, domain: Partial<Feedback>): Promise<Feedback> {
    const entity = FeedbackMapper.toPersistence(domain as Feedback);
    await this.repository.update(id, entity);
    const updated = await this.repository.findOne({ where: { id } });

    if (!updated) {
      throw new Error('Feedback not found');
    }

    return FeedbackMapper.toDomain(updated);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { deletedAt: new Date() });
  }
}
