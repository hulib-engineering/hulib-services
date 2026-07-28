import { ContestReport } from '../../../../domain/contest-report';
import { ContestReportEntity } from '../entities/contest-report.entity';

export class ContestReportMapper {
  static toDomain(raw: ContestReportEntity): ContestReport {
    const domainEntity = new ContestReport();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: ContestReport): ContestReportEntity {
    const persistenceEntity = new ContestReportEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
