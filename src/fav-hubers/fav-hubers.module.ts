import { Module } from '@nestjs/common';

import { UserFavoriteHuberController } from './fav-hubers.controller';
import { UserFavoriteHuberService } from './fav-hubers.service';

@Module({
  controllers: [UserFavoriteHuberController],
  providers: [UserFavoriteHuberService],
  exports: [UserFavoriteHuberService],
})
export class FavHubersModule {}
