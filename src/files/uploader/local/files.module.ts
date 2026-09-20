import { Module } from '@nestjs/common';
import * as fs from 'fs';
import { FilesLocalController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

import { FilesLocalService } from './files.service';
import { FileRepository } from '@files/file.repository';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        return {
          storage: diskStorage({
            destination: (req, file, callback) => {
              const uploadPath = './files';
              if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
                fs.writeFileSync(`${uploadPath}/.files`, '');
              }
              callback(null, uploadPath);
            },
            filename: (request, file, callback) => {
              callback(
                null,
                `${randomStringGenerator()}.${file.originalname
                  .split('.')
                  .pop()
                  ?.toLowerCase()}`,
              );
            },
          }),
        };
      },
    }),
  ],
  controllers: [FilesLocalController],
  providers: [ConfigModule, ConfigService, FileRepository, FilesLocalService],
  exports: [FileRepository, FilesLocalService],
})
export class FilesLocalModule {}
