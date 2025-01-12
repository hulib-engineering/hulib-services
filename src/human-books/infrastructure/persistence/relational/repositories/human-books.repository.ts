import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HumanBooksEntity } from '../entities/human-books.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { HumanBooks } from '../../../../domain/human-books';
import { HumanBooksRepository } from '../../human-books.repository';
import { HumanBooksMapper } from '../mappers/human-books.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { User } from '../../../../../users/domain/user';

@Injectable()
export class HumanBooksRelationalRepository implements HumanBooksRepository {
  constructor(
    @InjectRepository(HumanBooksEntity)
    private readonly humanBooksRepository: Repository<HumanBooksEntity>,
  ) {}

  async create(data: HumanBooks): Promise<HumanBooks> {
    const persistenceModel = HumanBooksMapper.toPersistence(data);
    const newEntity = await this.humanBooksRepository.save(
      this.humanBooksRepository.create(persistenceModel),
    );
    return HumanBooksMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<HumanBooks[]> {
    const entities = await this.humanBooksRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => HumanBooksMapper.toDomain(entity));
  }

  async findById(id: HumanBooks['id']): Promise<NullableType<HumanBooks>> {
    const entity = await this.humanBooksRepository.findOne({
      where: { id },
    });

    return entity ? HumanBooksMapper.toDomain(entity) : null;
  }

  async update(
    id: HumanBooks['id'],
    payload: Partial<HumanBooks>,
  ): Promise<HumanBooks> {
    const entity = await this.humanBooksRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.humanBooksRepository.save(
      this.humanBooksRepository.create(
        HumanBooksMapper.toPersistence({
          ...HumanBooksMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return HumanBooksMapper.toDomain(updatedEntity);
  }

  async remove(id: HumanBooks['id']): Promise<void> {
    await this.humanBooksRepository.delete(id);
  }

  async findByUserId(userId: User['id']): Promise<NullableType<HumanBooks>> {
    const entity = await this.humanBooksRepository.findOne({
      where: { user: { id: Number(userId) } },
    });

    return entity ? HumanBooksMapper.toDomain(entity) : null;
  }
}
