import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Story } from '../stories/domain/story';
import { SaveFavStoryDto } from './dto/save-fav-story.dto';
import { FavStoriesService } from './fav-stories.service';
@ApiTags('Fav_Stories')
@Controller({
  path: 'fav_stories',
  version: '1',
})
export class FavStoriesController {
  constructor(private readonly FavStoriesService: FavStoriesService) {}

  @Post()
  @ApiCreatedResponse({
    type: Story,
  })
  create(@Body() saveFavStoryDto: SaveFavStoryDto) {
    return saveFavStoryDto;
  }

  @Get()
  @ApiOkResponse({
    description: 'List of favorite stories',
    type: [Story],
  })
  async getFavoriteStories(@Query('userId') userId: number) {
    return this.FavStoriesService.getFavoriteStories(userId);
  }
}
