import { Moderation } from '../../../../domain/moderation';
import { ModerationEntity } from '../entities/moderation.entity';

export class ModerationMapper {
  static toDomain(raw: ModerationEntity): Moderation {
    const domainEntity = new Moderation();
    domainEntity.id = raw.id;
    domainEntity.actionType = raw.actionType;
    domainEntity.status = raw.status;
    domainEntity.userId = raw.userId;
    domainEntity.reportId = raw.reportId;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Moderation): ModerationEntity {
    const persistenceEntity = new ModerationEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }

    persistenceEntity.actionType = domainEntity.actionType;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.reportId = domainEntity.reportId;

    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
