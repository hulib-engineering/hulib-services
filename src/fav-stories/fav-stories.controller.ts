import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Story } from '@stories/domain/story';
import { SaveFavStoryDto } from './dto/save-fav-story.dto';
import { FavStoriesService } from './fav-stories.service';

@ApiTags('Favorited Stories')
@Controller({
  path: 'fav-stories',
  version: '1',
})
export class FavStoriesController {
  constructor(private readonly FavStoriesService: FavStoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new favorite story' })
  @ApiCreatedResponse({
    type: Story,
  })
  create(@Body() saveFavStoryDto: SaveFavStoryDto) {
    console.log('DTO received:', saveFavStoryDto);
    return this.FavStoriesService.saveFavoriteStory(
      saveFavStoryDto.storyId,
      saveFavStoryDto.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all favorite stories' })
  @ApiOkResponse({
    description: 'List of favorite stories',
    type: [Story],
  })
  async getFavoriteStories(@Query('userId') userId: number) {
    return this.FavStoriesService.getFavoriteStories(userId);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove all favorite stories' })
  @ApiOkResponse({
    description: 'Remote list of favorite stories',
    type: [Story],
  })
  async removeAllFavoriteStories(@Query('userId') userId: number) {
    return this.FavStoriesService.removeAllFavoriteStories(userId);
  }

  @Delete(':storyId')
  @ApiOperation({ summary: 'Remove a favorite story' })
  @ApiOkResponse({
    description: 'Remove a favorite story',
    type: Story,
  })
  async removeFavoriteStory(
    @Param('storyId') storyId: number,
    @Query('userId') userId: number,
  ) {
    return this.FavStoriesService.removeFavoriteStory(storyId, userId);
  }
}
