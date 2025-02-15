import { Module } from '@nestjs/common';
import { FavStoriesController } from './fav-stories.controller';
import { UsersModule } from '@users/users.module';
import { FavStoriesService } from './fav-stories.service';

@Module({
  imports: [UsersModule],
  controllers: [FavStoriesController],
  providers: [FavStoriesService],
  exports: [FavStoriesService],
})
export class FavStoriesModule {}
