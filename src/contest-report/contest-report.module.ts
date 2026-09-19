import { Module } from '@nestjs/common';
import { StoriesModule } from '@stories/stories.module';
import { ContestReportService } from './contest-report.service';
import { ContestReportRepository } from './contest-report.repository';
import { ContestReportController } from './contest-report.controller';

@Module({
  imports: [StoriesModule],
  controllers: [ContestReportController],
  providers: [ContestReportService, ContestReportRepository],
  exports: [ContestReportService],
})
export class ContestReportModule {}
