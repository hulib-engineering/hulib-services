import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import {
  ApiBearerAuth,
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
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@utils/dto/pagination-input.dto';
import { StoryReviewsService } from '@story-reviews/story-reviews.service';
import { PublishStatus } from './status.enum';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@roles/roles.decorator';
import { RoleEnum } from '@roles/roles.enum';
import { RolesGuard } from '@roles/roles.guard';

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
  @Roles(RoleEnum.humanBook, RoleEnum.reader)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiCreatedResponse({
    type: Story,
  })
  create(@Request() request, @Body() createStoriesDto: CreateStoryDto) {
    if (request.user.role.id === RoleEnum.reader) {
      return this.storiesService.createFirst(request.user.id, createStoriesDto);
    }
    return this.storiesService.create(createStoriesDto);
  }

  @SerializeOptions({
    groups: ['admin'],
    excludePrefixes: ['__'],
  })
  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: InfinityPaginationResponse(Story),
  })
  async findAll(
    @Request() request,
    @Query() query: FindAllStoriesDto,
  ): Promise<InfinityPaginationResponseDto<Story>> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const isAdmin = request.user.role.id === RoleEnum.admin;
    const defaultPublishStatus = isAdmin
      ? PublishStatus.draft
      : PublishStatus.published;

    return infinityPagination(
      await this.storiesService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
        filterOptions: {
          humanBookId: query.humanBookId,
          topicIds: query.topicIds,
          publishStatus: query.publishStatus || defaultPublishStatus,
        },
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

  @Patch(':id')
  @Roles(RoleEnum.humanBook, RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
