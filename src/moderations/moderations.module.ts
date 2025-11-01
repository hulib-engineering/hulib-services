import { Module } from '@nestjs/common';
import { RelationalReportPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ModerationsController } from './moderations.controller';
import { ModerationsService } from './moderations.service';

@Module({
  imports: [RelationalReportPersistenceModule],
  controllers: [ModerationsController],
  providers: [ModerationsService],
  exports: [ModerationsService, RelationalReportPersistenceModule],
})
export class ModerationsModule {}
