import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ReadingSessionEntity } from '../entities/reading-session.entity';
import { ReadingSession } from '../../../../domain/reading-session';
import { ReadingSessionMapper } from '../mappers/reading-sessions.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class ReadingSessionRepository {
  constructor(
    @InjectRepository(ReadingSessionEntity)
    private readonly repository: Repository<ReadingSessionEntity>,
  ) {}

  async create(domain: ReadingSession): Promise<ReadingSession> {
    const entity = ReadingSessionMapper.toPersistence(domain);
    const newEntity = await this.repository.save(entity);
    return ReadingSessionMapper.toDomain(newEntity);
  }

  async findById(id: number): Promise<ReadingSession | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: [
        'humanBook',
        'reader',
        'story',
        'authorSchedule',
        'feedbacks',
        'messages',
      ],
    });
    return entity ? ReadingSessionMapper.toDomain(entity) : null;
  }

  async findManyWithPagination({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions?: any;
    paginationOptions: IPaginationOptions;
  }): Promise<ReadingSession[]> {
    const where: FindOptionsWhere<ReadingSessionEntity> = {};

    if (filterOptions?.humanBookId) {
      where.humanBookId = filterOptions.humanBookId;
    }

    if (filterOptions?.readerId) {
      where.readerId = filterOptions.readerId;
    }

    if (filterOptions?.sessionStatus) {
      where.sessionStatus = filterOptions.sessionStatus;
    }

    const entities = await this.repository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      relations: ['humanBook', 'reader', 'story', 'authorSchedule'],
    });

    return entities.map((entity) => ReadingSessionMapper.toDomain(entity));
  }

  async update(
    id: number,
    domain: Partial<ReadingSession>,
  ): Promise<ReadingSession> {
    const entity = ReadingSessionMapper.toPersistence(domain as ReadingSession);
    await this.repository.update(id, entity);
    const updated = await this.repository.findOne({ where: { id } });

    if (!updated) {
      throw new Error('Reading session not found');
    }

    return ReadingSessionMapper.toDomain(updated);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { deletedAt: new Date() });
  }
}
