import { Module } from '@nestjs/common';
import { SessionRepository } from '../session.repository';
import { SessionRepositoryImplement } from './repositories/session-prisma.repository';

@Module({
  providers: [
    {
      provide: SessionRepository,
      useClass: SessionRepositoryImplement,
    },
  ],
  exports: [SessionRepository],
})
export class RelationalSessionPersistenceModule {}
