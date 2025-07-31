import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { RelationalReportPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalReportPersistenceModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService, RelationalReportPersistenceModule],
})
export class ReportsModule {}
