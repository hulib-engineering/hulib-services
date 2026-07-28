import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContestReportRepository } from '../contest-report.repository';
import { ContestReportEntity } from './entities/contest-report.entity';
import { RelationalContestReportRepository } from './repositories/contest-report.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ContestReportEntity])],
  providers: [
    {
      provide: ContestReportRepository,
      useClass: RelationalContestReportRepository,
    },
  ],
  exports: [ContestReportRepository],
})
export class RelationalContestReportPersistenceModule {}
