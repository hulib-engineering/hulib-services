import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { storyFavouritesEntity } from '@fav-stories/infrastructure/persistence/relational/entities/fav-stories.entity';
import { storyFavouritesSeedService } from './story-favourites-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([storyFavouritesEntity])],
  providers: [storyFavouritesSeedService],
  exports: [storyFavouritesSeedService],
})
export class storyFavouritesSeedModule {}
