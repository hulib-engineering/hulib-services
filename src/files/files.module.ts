import { Module } from '@nestjs/common';

import { FilesService } from './files.service';
import { FileRepository } from './file.repository';
import fileConfig from './config/file.config';
import { FileConfig, FileDriver } from './config/file-config.type';
import { FilesLocalModule } from './uploader/local/files.module';
import { FilesS3Module } from './uploader/s3/files.module';
import { FilesS3PresignedModule } from './uploader/s3-presigned/files.module';

const fileConfiguration = fileConfig() as FileConfig;

const infrastructureUploaderModule =
  fileConfiguration.driver === FileDriver.LOCAL
    ? FilesLocalModule
    : [FileDriver.S3, FileDriver.S3_PRESIGNED].includes(
          fileConfiguration.driver,
        )
      ? FilesS3Module
      : FilesS3PresignedModule;

@Module({
  imports: [infrastructureUploaderModule],
  providers: [FileRepository, FilesService],
  exports: [FileRepository, FilesService],
})
export class FilesModule {}
