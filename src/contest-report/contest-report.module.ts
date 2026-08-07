import { Module } from '@nestjs/common';
import { StoriesModule } from '@stories/stories.module';
import { ContestReportService } from './contest-report.service';
import { ContestReportController } from './contest-report.controller';
import { RelationalContestReportPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ContestReportFirestoreService } from './contest-report-firestore.service';

@Module({
  imports: [StoriesModule, RelationalContestReportPersistenceModule],
  controllers: [ContestReportController],
  providers: [ContestReportService, ContestReportFirestoreService],
  exports: [ContestReportService, ContestReportFirestoreService],
})
export class ContestReportModule {}
