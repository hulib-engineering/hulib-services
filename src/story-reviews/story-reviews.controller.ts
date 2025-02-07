import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { StoryReviewsService } from './story-reviews.service';
import { CreateStoryReviewDto } from './dto/create-story-review.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { QueryStoryReviewDto } from './dto/query-story-review.dto';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../utils/dto/pagination-input.dto';
import { infinityPagination } from '@utils/infinity-pagination';
import { InfinityPaginationResponse } from '../utils/dto/infinity-pagination-response.dto';
import { StoryReview } from './entities/story-review.entity';

@ApiTags('Story Reviews')
@Controller({
  path: 'story-reviews',
  version: '1',
})
export class StoryReviewsController {
  constructor(private readonly storyReviewsService: StoryReviewsService) {}

  @Post()
  create(@Body() createStoryReviewDto: CreateStoryReviewDto) {
    return this.storyReviewsService.create(createStoryReviewDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(StoryReview),
  })
  async findAll(@Query() query: QueryStoryReviewDto) {
    return infinityPagination(
      await this.storyReviewsService.findManyWithPagination({
        paginationOptions: {
          page: query?.page ?? DEFAULT_PAGE,
          limit: query?.limit ?? DEFAULT_LIMIT,
        },
        filterOptions: {
          storyId: query?.storyId,
        },
      }),
      {
        page: query?.page ?? DEFAULT_PAGE,
        limit: query?.limit ?? DEFAULT_LIMIT,
      },
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storyReviewsService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateStoryReviewDto: UpdateStoryReviewDto) {
  //   return this.storyReviewsService.update(+id, updateStoryReviewDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.storyReviewsService.remove(+id);
  // }
}
