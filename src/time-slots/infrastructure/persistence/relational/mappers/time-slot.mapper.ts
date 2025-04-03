import { TimeSlotEntity } from '../entities/tims-slot.entity';
import { TimeSlot } from '../../../../domain/time-slot';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';

export class TimeSlotMapper {
  static toDomain(raw: Partial<TimeSlotEntity>): TimeSlot {
    const domain = new TimeSlot();
    domain.dayOfWeek = raw.dayOfWeek ?? 0;
    domain.startTime = raw.startTime ?? '';
    domain.id = raw.id ?? 0;
    domain.userId = raw.userId ?? 0;
    if (raw.createdAt) {
      domain.createdAt = raw.createdAt;
    }
    if (raw.updatedAt) {
      domain.updatedAt = raw.updatedAt;
    }
    if (raw.user) {
      domain.user = UserMapper.toDomain(raw.user);
    }

    return domain;
  }

  static toPersistence(domainEntity: TimeSlot): TimeSlotEntity {
    const persistenceEntity = new TimeSlotEntity();
    persistenceEntity.dayOfWeek = domainEntity.dayOfWeek;
    persistenceEntity.startTime = domainEntity.startTime;
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.userId = domainEntity.userId;
    if (domainEntity.user) {
      persistenceEntity.user = UserMapper.toPersistence(domainEntity.user);
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
