import { Module } from '@nestjs/common';
import { ModerationRepository } from '../moderation.repository';
import { ModerationRelationalRepository } from './repositories/relational-moderation.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModerationEntity } from './entities/moderation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModerationEntity])],
  providers: [
    {
      provide: ModerationRepository,
      useClass: ModerationRelationalRepository,
    },
  ],
  exports: [ModerationRepository],
})
export class RelationalReportPersistenceModule {}
