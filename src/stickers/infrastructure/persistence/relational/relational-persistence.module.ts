import { Module } from '@nestjs/common';
import { StickerRepository } from '../sticker.repository';
import { StickerRepositoryImplement } from './repositories/sticker-prisma.repository';

@Module({
  providers: [
    {
      provide: StickerRepository,
      useClass: StickerRepositoryImplement,
    },
  ],
  exports: [StickerRepository],
})
export class RelationalStickerPersistenceModule {}
