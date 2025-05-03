import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { storyFavouritesEntity } from '../../../../story-favourites/infrastructure/persistence/relational/entities/story-favourites.entity';
import { storyFavouritesSeedService } from './story-favourites-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([storyFavouritesEntity])],
  providers: [storyFavouritesSeedService],
  exports: [storyFavouritesSeedService],
})
export class storyFavouritesSeedModule {}
