import { Report } from '../../../../domain/report';
import { ReportEntity } from '../entities/report.entity';

export class ReportMapper {
  static toDomain(raw: ReportEntity): Report {
    const domainEntity = new Report();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

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
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
