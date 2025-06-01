import { notification } from '../../../../domain/notification';
import { notificationEntity } from '../entities/notification.entity';

export class notificationMapper {
  static toDomain(raw: notificationEntity): notification {
    const domainEntity = new notification();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: notification): notificationEntity {
    const persistenceEntity = new notificationEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
