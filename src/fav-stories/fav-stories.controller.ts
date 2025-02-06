import { Controller, Post, Body } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Story } from '../stories/domain/story';
import { SaveFavStoryDto } from './dto/save-fav-story.dto';

@ApiTags('Fav Stories')
@Controller({
  path: 'fav-stories',
  version: '1',
})
export class FavStoriesController {
  constructor() {}

  @Post()
  @ApiCreatedResponse({
    type: Story,
  })
  create(@Body() saveFavStoryDto: SaveFavStoryDto) {
    return saveFavStoryDto;
  }
}
