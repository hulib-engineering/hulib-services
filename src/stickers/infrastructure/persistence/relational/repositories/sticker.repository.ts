import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StickerEntity } from '../entities/sticker.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Sticker } from '../../../../domain/sticker';
import { StickerRepository } from '../../sticker.repository';
import { StickerMapper } from '../mappers/sticker.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class StickerRelationalRepository implements StickerRepository {
  constructor(
    @InjectRepository(StickerEntity)
    private readonly stickerRepository: Repository<StickerEntity>,
  ) {}

  async create(data: Sticker): Promise<Sticker> {
    const persistenceModel = StickerMapper.toPersistence(data);
    const newEntity = await this.stickerRepository.save(
      this.stickerRepository.create(persistenceModel),
    );
    return StickerMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Sticker[]> {
    const entities = await this.stickerRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      relations: { image: true },
    });

    return entities.map((entity) => StickerMapper.toDomain(entity));
  }

  async findById(id: Sticker['id']): Promise<NullableType<Sticker>> {
    const entity = await this.stickerRepository.findOne({
      where: { id },
    });

    return entity ? StickerMapper.toDomain(entity) : null;
  }

  async update(id: Sticker['id'], payload: Partial<Sticker>): Promise<Sticker> {
    const entity = await this.stickerRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.stickerRepository.save(
      this.stickerRepository.create(
        StickerMapper.toPersistence({
          ...StickerMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return StickerMapper.toDomain(updatedEntity);
  }

  async remove(id: Sticker['id']): Promise<void> {
    await this.stickerRepository.delete(id);
  }
}
