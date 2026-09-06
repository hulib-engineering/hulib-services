import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { FileRepository } from '../file.repository';
import { PrismaFileRepository } from '../prisma/repositories/file-prisma.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  providers: [
    {
      provide: FileRepository,
      useClass: PrismaFileRepository,
    },
  ],
  exports: [FileRepository],
})
export class RelationalFilePersistenceModule {}
