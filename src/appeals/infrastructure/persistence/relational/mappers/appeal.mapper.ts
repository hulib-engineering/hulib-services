import { Appeal } from '../../../../domain/appeal';
import { AppealEntity } from '../entities/appeal.entity';
import { ModerationMapper } from '../../../../../moderations/infrastructure/persistence/relational/mappers/moderation.mapper';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';

export class AppealMapper {
  static toDomain(raw: AppealEntity): Appeal {
    const domainEntity = new Appeal();
    domainEntity.id = raw.id;
    domainEntity.moderationId = raw.moderationId;
    domainEntity.userId = raw.userId;
    domainEntity.message = raw.message;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    if (raw.moderation) {
      domainEntity.moderation = ModerationMapper.toDomain(raw.moderation);
    }

    if (raw.user) {
      domainEntity.user = UserMapper.toDomain(raw.user);
    }

    return domainEntity;
  }

  static toPersistence(domainEntity: Appeal): AppealEntity {
    const persistenceEntity = new AppealEntity();

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    persistenceEntity.moderationId = domainEntity.moderationId;
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.message = domainEntity.message;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;

    return persistenceEntity;
  }
}
