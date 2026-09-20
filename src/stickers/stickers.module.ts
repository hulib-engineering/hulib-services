import { Module } from '@nestjs/common';
import { StickerRepository } from './sticker.repository';
import { StickersService } from './stickers.service';
import { StickersController } from './stickers.controller';

@Module({
  controllers: [StickersController],
  providers: [StickersService, StickerRepository],
  exports: [StickersService, StickerRepository],
})
export class StickersModule {}
