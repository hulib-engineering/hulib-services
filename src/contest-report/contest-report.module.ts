import { Module } from '@nestjs/common';
import { StoriesModule } from '@stories/stories.module';
import { ContestReportService } from './contest-report.service';
import { ContestReportController } from './contest-report.controller';
import { RelationalContestReportPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [StoriesModule, RelationalContestReportPersistenceModule],
  controllers: [ContestReportController],
  providers: [ContestReportService],
  exports: [ContestReportService],
})
export class ContestReportModule {}
