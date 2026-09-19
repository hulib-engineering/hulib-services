import { Module } from '@nestjs/common';
import { RelationalStickerPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { StickersService } from './stickers.service';
import { StickersController } from './stickers.controller';

@Module({
  imports: [RelationalStickerPersistenceModule],
  controllers: [StickersController],
  providers: [StickersService],
  exports: [StickersService, RelationalStickerPersistenceModule],
})
export class StickersModule {}
