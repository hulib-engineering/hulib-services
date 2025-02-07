import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Story } from './domain/story';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '@utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '@utils/infinity-pagination';
import { FindAllStoriesDto } from './dto/find-all-stories.dto';
import { DEFAULT_LIMIT } from '../utils/dto/pagination-input.dto';
import { DEFAULT_PAGE } from '../utils/dto/pagination-input.dto';
import { StoryReviewsService } from '@story-reviews/story-reviews.service';

@ApiTags('Stories')
// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'stories',
  version: '1',
})
export class StoriesController {
  constructor(
    private readonly storiesService: StoriesService,
    private readonly storyReviewService: StoryReviewsService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    type: Story,
  })
  create(@Body() createStoriesDto: CreateStoryDto) {
    return this.storiesService.create(createStoriesDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Story),
  })
  async findAll(
    @Query() query: FindAllStoriesDto,
  ): Promise<InfinityPaginationResponseDto<Story>> {
    const {
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      filters: filterOptions,
      sort: sortOptions,
    } = query || {};
    return infinityPagination(
      await this.storiesService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
        filterOptions,
        sortOptions,
      }),
      {
        page,
        limit,
      },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Story,
  })
  findOne(@Param('id') id: Story['id']) {
    return this.storiesService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Story,
  })
  update(
    @Param('id') id: Story['id'],
    @Body() updateStoriesDto: UpdateStoryDto,
  ) {
    return this.storiesService.update(id, updateStoriesDto);
  }

  // @Delete(':id')
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   required: true,
  // })
  // remove(@Param('id') id: Story['id']) {
  //   return this.storiesService.remove(id);
  // }

  // @Get(':id/details')
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   required: true,
  // })
  // @ApiOkResponse({
  //   type: Story,
  // })
  // async getStoryDetails(@Param('id') id: number) {
  //   return this.storiesService.findDetailedStory(id);
  // }

  // @Get(':id/human-book')
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   required: true,
  //   example: '7',
  // })
  // @ApiOkResponse({
  //   type: User,
  // })
  // getHumanBook(@Param('id') id: User['id']) {
  //   return this.usersService.findHumanBookById(id);
  // }

  // @Get(':id/reviews')
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   required: true,
  // })
  // @ApiOkResponse({
  //   type: InfinityPaginationResponse(StoryReview),
  // })
  // getReviews(@Param('id') id: Story['id']) {
  //   return {
  //     data: storyReviewsData,
  //     hasNextPage: false,
  //   }
  // }

  @Get(':id/reviews-overview')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  getReviewsOverview(@Param('id') id: Story['id']) {
    return this.storyReviewService.getReviewsOverview(id);
  }
}
