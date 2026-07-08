import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  SerializeOptions,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
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
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@utils/dto/pagination-input.dto';
import { StoryReviewsService } from '@story-reviews/story-reviews.service';
import { PublishStatus } from './status.enum';
import { RoleEnum } from '@roles/roles.enum';
import { pagination } from '@utils/pagination';
import { PaginationResponseDto } from '@utils/dto/pagination-response.dto';

@ApiTags('Stories')
@ApiBearerAuth()
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
  create(@Request() request, @Body() createStoriesDto: CreateStoryDto) {
    if (request.user?.role?.id === RoleEnum.reader) {
      return this.storiesService.createFirst(request.user.id, createStoriesDto);
    }
    return this.storiesService.create(createStoriesDto);
  }

  @SerializeOptions({
    groups: ['admin'],
    excludePrefixes: ['__'],
  })
  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Story),
  })
  async findAll(
    @Request() request,
    @Query() query: FindAllStoriesDto,
  ): Promise<
    InfinityPaginationResponseDto<Story> | PaginationResponseDto<Story>
  > {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const currentUser = request.user;
    const isAdmin = currentUser?.role?.id === RoleEnum.admin;

    if (isAdmin) {
      const { data, count } =
        await this.storiesService.findAllWithCountAndPagination({
          paginationOptions: {
            page,
            limit,
          },
          filterOptions: {
            humanBookId: query.humanBookId,
            topicIds: query.topicIds,
            publishStatus: query.publishStatus || PublishStatus.pending,
            type: query.type,
          },
          sortOptions: query?.sort ?? undefined,
        });
      return pagination(data, count, { page, limit });
    }

    return infinityPagination(
      await this.storiesService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
        filterOptions: {
          humanBookId: query.humanBookId,
          topicIds: query.topicIds,
          publishStatus: query.publishStatus || PublishStatus.published,
          type: query.type,
        },
        sortOptions: query?.sort ?? undefined,
        currentUserId: currentUser?.id,
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: Story,
  })
  findOne(@Param('id') id: Story['id']) {
    return this.storiesService.findOne(id);
  }

  @Post(':id/share')
  @ApiOperation({
    summary: 'Increase story share count',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    schema: {
      example: {
        id: 1,
        shareCount: 3,
      },
    },
  })
  share(@Param('id', ParseIntPipe) id: Story['id']) {
    return this.storiesService.share(id);
  }

  @Post(':id/like')
  @ApiOperation({
    summary: 'Increase story like count',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    schema: {
      example: {
        id: 1,
        likeCount: 8,
      },
    },
  })
  like(@Param('id', ParseIntPipe) id: Story['id']) {
    return this.storiesService.like(id);
  }

  @Get(':id/topics')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: Story,
  })
  findRelatedTopics(@Param('id') id: Story['id']) {
    return this.storiesService.getTopics(id);
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

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: Story['id']) {
    return this.storiesService.remove(id);
  }

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
