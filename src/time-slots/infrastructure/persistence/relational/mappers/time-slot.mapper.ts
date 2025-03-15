import { TimeSlotEntity } from '../entities/tims-slot.entity';
import { TimeSlot } from '../../../../domain/time-slot';

export class TimeSlotMapper {
  static toDomain(raw: TimeSlotEntity): TimeSlot {
    const domainEntity = new TimeSlot();
    domainEntity.dayOfWeek = raw.dayOfWeek;
    domainEntity.startTime = raw.startTime;
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: TimeSlot): TimeSlotEntity {
    const persistenceEntity = new TimeSlotEntity();
    persistenceEntity.dayOfWeek = domainEntity.dayOfWeek;
    persistenceEntity.startTime = domainEntity.startTime;
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
