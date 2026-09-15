import { Module } from '@nestjs/common';
import * as fs from 'fs';
import { FilesLocalController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

import { FilesLocalService } from './files.service';
import { RelationalFilePersistenceModule } from '@files/infrastructure/persistence/relational/relational-persistence.module';

const infrastructurePersistenceModule = RelationalFilePersistenceModule;

@Module({
  imports: [
    infrastructurePersistenceModule,
    MulterModule.registerAsync({
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
  providers: [FilesLocalService],
  exports: [FilesLocalService],
})
export class FilesLocalModule {}
