import { Module } from '@nestjs/common';
import { ContestReportRepository } from '../contest-report.repository';
import { RelationalContestReportRepository } from './repositories/contest-report.repository';

@Module({
  providers: [
    {
      provide: ContestReportRepository,
      useClass: RelationalContestReportRepository,
    },
  ],
  exports: [ContestReportRepository],
})
export class RelationalContestReportPersistenceModule {}
