import { Module } from '@nestjs/common';
import { ModerationRepository } from '../moderation.repository';
import { ModerationRelationalRepository } from './repositories/relational-moderation.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModerationEntity } from './entities/moderation.entity';
import { ReportEntity } from '@reports/infrastructure/persistence/relational/entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    ModerationEntity,
    ReportEntity,
  ])],
  providers: [
    {
      provide: ModerationRepository,
      useClass: ModerationRelationalRepository,
    },
  ],
  exports: [ModerationRepository],
})
export class RelationalReportPersistenceModule {}
