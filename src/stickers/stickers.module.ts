import { Module } from '@nestjs/common';
import { StickersService } from './stickers.service';
import { StickersController } from './stickers.controller';
import { RelationalStickerPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalStickerPersistenceModule],
  controllers: [StickersController],
  providers: [StickersService],
  exports: [StickersService, RelationalStickerPersistenceModule],
})
export class StickersModule {}
