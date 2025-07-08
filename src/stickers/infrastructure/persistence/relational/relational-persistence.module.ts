import { Module } from '@nestjs/common';
import { StickerRepository } from '../sticker.repository';
import { StickerRelationalRepository } from './repositories/sticker.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StickerEntity } from './entities/sticker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StickerEntity])],
  providers: [
    {
      provide: StickerRepository,
      useClass: StickerRelationalRepository,
    },
  ],
  exports: [StickerRepository],
})
export class RelationalStickerPersistenceModule {}
