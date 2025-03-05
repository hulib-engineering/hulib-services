import { UserMapper } from '@users/infrastructure/persistence/relational/mappers/user.mapper';
import { SchedulesEntity } from '../entities/schedules.entity';
import { Schedules } from '../../../../domain/schedules';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

export class SchedulesMapper {
  static toDomain(entity: SchedulesEntity): Schedules {
    const domainModel = new Schedules();
    domainModel.id = entity.id;
    domainModel.startedAt = entity.startedAt;
    domainModel.startTime = entity.startTime;
    domainModel.endedAt = entity.endedAt;
    domainModel.endTime = entity.endTime;
    domainModel.isBooked = entity.isBooked;
    domainModel.createdAt = entity.createdAt;
    domainModel.updatedAt = entity.updatedAt;
    domainModel.deletedAt = entity.deletedAt;

    if (entity.humanBook) {
      domainModel.humanBook = UserMapper.toDomain(
        entity.humanBook as UserEntity,
      );
    }

    return domainModel;
  }

  static toPersistence(domain: Schedules): SchedulesEntity {
    const entity = new SchedulesEntity();
    entity.id = domain.id;
    entity.startedAt = domain.startedAt;
    entity.startTime = domain.startTime ?? '';
    entity.endedAt = domain.endedAt;
    entity.endTime = domain.endTime ?? '';
    entity.isBooked = domain.isBooked ?? false;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt ?? new Date();

    if (domain.humanBook) {
      entity.humanBook = UserMapper.toPersistence(domain.humanBook);
    }

    return entity;
  }
}
