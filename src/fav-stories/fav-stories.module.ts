import { Module } from '@nestjs/common';
import { FavStoriesController } from './fav-stories.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [FavStoriesController],
  providers: [],
  exports: [],
})
export class FavStoriesModule {}
