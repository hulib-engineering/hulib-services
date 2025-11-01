import { UserMapper } from '@users/infrastructure/persistence/relational/mappers/user.mapper';
import { Report } from '../../../../domain/report';
import { ReportEntity } from '../entities/report.entity';

export class ReportMapper {
  static toDomain(raw: ReportEntity): Report {
    const domainEntity = new Report();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    domainEntity.reason = raw.reason;
    domainEntity.customReason = raw.customReason;
    domainEntity.markAsResolved = raw.markAsResolved;
    domainEntity.rejectedReason = raw.rejectedReason;
    domainEntity.rejectedCustomReason = raw.rejectedCustomReason;

    domainEntity.reporterId = raw.reporterId;
    domainEntity.reportedUserId = raw.reportedUserId;

    if (raw.reporter) {
      domainEntity.reporter = UserMapper.toDomain(raw.reporter);
    }

    if (raw.reportedUser) {
      domainEntity.reportedUser = UserMapper.toDomain(raw.reportedUser);
    }

    return domainEntity;
  }

  static toPersistence(domainEntity: Report): ReportEntity {
    const persistenceEntity = new ReportEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.reason = domainEntity.reason;
    persistenceEntity.customReason = domainEntity.customReason;
    persistenceEntity.markAsResolved = domainEntity.markAsResolved;
    persistenceEntity.rejectedReason = domainEntity.rejectedReason;
    persistenceEntity.rejectedCustomReason = domainEntity.rejectedCustomReason;

    persistenceEntity.reporterId = domainEntity.reporterId;
    persistenceEntity.reportedUserId = domainEntity.reportedUserId;

    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
