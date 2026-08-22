import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
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
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page',
  })
  async getFavoriteStories(
    @Query('userId') userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(Math.max(1, Number(limit) || 10), 50);
    return this.FavStoriesService.getFavoriteStories(userId, {
      page: pageNum,
      limit: limitNum,
    });
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFavoriteStory(
    @Param('storyId') storyId: number,
    @Query('userId') userId: number,
  ) {
    return this.FavStoriesService.removeFavoriteStory(storyId, userId);
  }
}
