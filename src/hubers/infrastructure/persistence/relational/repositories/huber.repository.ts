import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HuberEntity } from '../entities/huber.entity';
import { NullableType } from '@utils/types/nullable.type';
import { Huber } from '../../../../domain/huber';
import { HuberRepository } from '../../huber.repository';
import { HuberMapper } from '../mappers/huber.mapper';
import { IPaginationOptions } from '@utils/types/pagination-options';

@Injectable()
export class HuberRelationalRepository implements HuberRepository {
  constructor(
    @InjectRepository(HuberEntity)
    private readonly huberRepository: Repository<HuberEntity>,
  ) {}

  async create(data: Huber): Promise<Huber> {
    const persistenceModel = HuberMapper.toPersistence(data);
    const newEntity = await this.huberRepository.save(
      this.huberRepository.create(persistenceModel),
    );
    return HuberMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Huber[]> {
    const entities = await this.huberRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => HuberMapper.toDomain(entity));
  }

  async findById(id: Huber['id']): Promise<NullableType<Huber>> {
    const entity = await this.huberRepository.findOne({
      where: { id },
    });

    return entity ? HuberMapper.toDomain(entity) : null;
  }

  async update(id: Huber['id'], payload: Partial<Huber>): Promise<Huber> {
    const entity = await this.huberRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.huberRepository.save(
      this.huberRepository.create(
        HuberMapper.toPersistence({
          ...HuberMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return HuberMapper.toDomain(updatedEntity);
  }

  async remove(id: Huber['id']): Promise<void> {
    await this.huberRepository.delete(id);
  }
}
