import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppealEntity } from '../entities/appeal.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Appeal } from '../../../../domain/appeal';
import { AppealRepository } from '../../appeal.repository';
import { AppealMapper } from '../mappers/appeal.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class AppealRelationalRepository implements AppealRepository {
  constructor(
    @InjectRepository(AppealEntity)
    private readonly appealRepository: Repository<AppealEntity>,
  ) {}

  async create(data: Appeal): Promise<Appeal> {
    const persistenceModel = AppealMapper.toPersistence(data);
    const newEntity = await this.appealRepository.save(
      this.appealRepository.create(persistenceModel),
    );
    return AppealMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Appeal[]> {
    const entities = await this.appealRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => AppealMapper.toDomain(entity));
  }

  async findById(id: Appeal['id']): Promise<NullableType<Appeal>> {
    const entity = await this.appealRepository.findOne({
      where: { id },
    });

    return entity ? AppealMapper.toDomain(entity) : null;
  }

  async findByModerationAndUser(
    moderationId: number,
    userId: number,
  ): Promise<NullableType<Appeal>> {
    const entity = await this.appealRepository.findOne({
      where: {
        moderationId,
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return entity ? AppealMapper.toDomain(entity) : null;
  }

  async update(id: Appeal['id'], payload: Partial<Appeal>): Promise<Appeal> {
    const entity = await this.appealRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.appealRepository.save(
      this.appealRepository.create(
        AppealMapper.toPersistence({
          ...AppealMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return AppealMapper.toDomain(updatedEntity);
  }

  async remove(id: Appeal['id']): Promise<void> {
    await this.appealRepository.delete(id);
  }
}
