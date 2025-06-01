import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { notificationEntity } from '../entities/notification.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { notification } from '../../../../domain/notification';
import { notificationRepository } from '../../notification.repository';
import { notificationMapper } from '../mappers/notification.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class notificationRelationalRepository
  implements notificationRepository
{
  constructor(
    @InjectRepository(notificationEntity)
    private readonly notificationRepository: Repository<notificationEntity>,
  ) {}

  async create(data: notification): Promise<notification> {
    const persistenceModel = notificationMapper.toPersistence(data);
    const newEntity = await this.notificationRepository.save(
      this.notificationRepository.create(persistenceModel),
    );
    return notificationMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<notification[]> {
    const entities = await this.notificationRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => notificationMapper.toDomain(entity));
  }

  async findById(id: notification['id']): Promise<NullableType<notification>> {
    const entity = await this.notificationRepository.findOne({
      where: { id },
    });

    return entity ? notificationMapper.toDomain(entity) : null;
  }

  async update(
    id: notification['id'],
    payload: Partial<notification>,
  ): Promise<notification> {
    const entity = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.notificationRepository.save(
      this.notificationRepository.create(
        notificationMapper.toPersistence({
          ...notificationMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return notificationMapper.toDomain(updatedEntity);
  }

  async remove(id: notification['id']): Promise<void> {
    await this.notificationRepository.delete(id);
  }
}
