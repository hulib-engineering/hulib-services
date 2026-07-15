import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma-client/prisma-client.module';
import { ContestReportService } from './contest-report.service';
import { ContestReportController } from './contest-report.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ContestReportController],
  providers: [ContestReportService],
  exports: [ContestReportService],
})
export class ContestReportModule {}
