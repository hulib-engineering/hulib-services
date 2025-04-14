import { Huber } from '../../../../domain/huber';
import { HuberEntity } from '../entities/huber.entity';

export class HuberMapper {
  static toDomain(raw: HuberEntity): Huber {
    const domainEntity = new Huber();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Huber): HuberEntity {
    const persistenceEntity = new HuberEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
