import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  MoreThan,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  In,
} from 'typeorm';
import { ReadingSessionEntity } from '../entities/reading-session.entity';
import { ReadingSession, ReadingSessionStatus } from '@reading-sessions/domain';
import { ReadingSessionMapper } from '../mappers/reading-sessions.mapper';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { FindAllReadingSessionsQueryDto } from '../../../../dto/reading-session/find-all-reading-sessions-query.dto';

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
      relations: ['humanBook', 'reader', 'story', 'messages'],
    });
    return entity ? ReadingSessionMapper.toDomain(entity) : null;
  }

  async find(options: {
    where:
      | FindOptionsWhere<ReadingSessionEntity>
      | FindOptionsWhere<ReadingSessionEntity>[];
    relations?: string[];
    order?: { [P in keyof ReadingSessionEntity]?: 'ASC' | 'DESC' };
    skip?: number;
    take?: number;
  }): Promise<ReadingSession[]> {
    const entities = await this.repository.find({
      where: options.where,
      relations: options.relations || [],
      order: options.order || {},
      skip: options.skip,
      take: options.take,
    });
    return entities.map((entity) => ReadingSessionMapper.toDomain(entity));
  }

  async findManyWithPagination({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions?: FindAllReadingSessionsQueryDto;
    paginationOptions?: IPaginationOptions;
  }): Promise<ReadingSession[]> {
    const where: FindOptionsWhere<ReadingSessionEntity> = {};

    if (filterOptions?.humanBookId) {
      where.humanBookId = filterOptions.humanBookId;
    }

    if (filterOptions?.readerId) {
      where.readerId = filterOptions.readerId;
    }

    if (filterOptions?.sessionStatuses?.length) {
      where.sessionStatus = In(filterOptions.sessionStatuses);
    } else {
      // Default to only pending and approved sessions
      where.sessionStatus = In([
        ReadingSessionStatus.PENDING,
        ReadingSessionStatus.APPROVED,
        ReadingSessionStatus.MISSED,
        ReadingSessionStatus.FINISHED,
      ]);
    }

    if (filterOptions?.upcoming) {
      where.startedAt = MoreThan(new Date());
      where.sessionStatus = ReadingSessionStatus.APPROVED;
    }

    if (filterOptions?.startedAt && filterOptions?.endedAt) {
      where.startedAt = Between(
        new Date(filterOptions.startedAt),
        new Date(filterOptions.endedAt),
      );
    } else if (filterOptions?.startedAt) {
      where.startedAt = MoreThanOrEqual(new Date(filterOptions.startedAt));
    } else if (filterOptions?.endedAt) {
      where.startedAt = LessThanOrEqual(new Date(filterOptions.endedAt));
    }

    const findOptions: any = {
      where: [
        { ...where, humanBookId: filterOptions?.userId },
        { ...where, readerId: filterOptions?.userId },
      ],
      relations: ['humanBook', 'reader', 'story'],
    };

    if (filterOptions?.upcoming) {
      findOptions.order = {
        startedAt: 'ASC',
      };
      findOptions.take = 1;
    }

    if (paginationOptions) {
      findOptions.skip = (paginationOptions.page - 1) * paginationOptions.limit;
      findOptions.take = paginationOptions.limit;
    }

    const entities = await this.repository.find(findOptions);

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
