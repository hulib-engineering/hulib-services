import { Module } from '@nestjs/common';
import { StickerSeedService } from './sticker-seed.service';

@Module({
  providers: [StickerSeedService],
  exports: [StickerSeedService],
})
export class StickerSeedModule {}
