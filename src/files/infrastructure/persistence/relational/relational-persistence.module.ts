import { Module } from '@nestjs/common';
import { FileRepository } from '../file.repository';
import { FileRepositoryImplement } from './repositories/file-prisma.repository';

@Module({
  providers: [
    {
      provide: FileRepository,
      useClass: FileRepositoryImplement,
    },
  ],
  exports: [FileRepository],
})
export class RelationalFilePersistenceModule {}
