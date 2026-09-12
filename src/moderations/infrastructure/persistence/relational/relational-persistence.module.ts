import { Module } from '@nestjs/common';
import { ModerationRepository } from '../moderation.repository';
import { ModerationRepositoryImplement } from './repositories/moderation-prisma.repository';

@Module({
  providers: [
    {
      provide: ModerationRepository,
      useClass: ModerationRepositoryImplement,
    },
  ],
  exports: [ModerationRepository],
})
export class RelationalModerationPersistenceModule {}
