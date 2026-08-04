import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Query,
  Request,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { StoriesService } from './stories.service';
import { FindAllStoriesDto } from './dto/find-all-stories.dto';
import { ReviewStoryDto } from './dto/review-story.dto';
import { Story } from './domain/story';
import { PublishStatus } from './status.enum';
import { RoleEnum } from '@roles/roles.enum';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@utils/dto/pagination-input.dto';
import { pagination } from '@utils/pagination';
import { PaginationResponseDto } from '@utils/dto/pagination-response.dto';

// Everything here is admin-only moderation tooling — kept out of
// StoriesController so the public story endpoints can never accidentally
// pick up admin-only defaults or fields again.
@ApiTags('Stories - Admin')
@Controller({
  path: 'admin/stories',
  version: '1',
})
export class StoriesAdminController {
  constructor(private readonly storiesService: StoriesService) {}

  @SerializeOptions({
    groups: ['admin'],
    excludePrefixes: ['__'],
  })
  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary:
      'Admin-only story listing/moderation queue — free publishStatus filter, defaults to pending.',
  })
  @ApiOkResponse({
    type: PaginationResponseDto<Story>,
  })
  async findAll(
    @Request() request,
    @Query() query: FindAllStoriesDto,
  ): Promise<PaginationResponseDto<Story>> {
    if (request.user?.role?.id !== RoleEnum.admin) {
      throw new ForbiddenException();
    }

    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

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

  @Patch(':id/review')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary:
      "Approve or reject a Huber's story. Approving also promotes the story owner to Huber.",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: Story,
  })
  async review(
    @Param('id') id: Story['id'],
    @Body() reviewStoryDto: ReviewStoryDto,
    @Request() request,
  ) {
    if (request.user?.role?.id !== RoleEnum.admin) {
      throw new ForbiddenException();
    }

    return this.storiesService.update(id, reviewStoryDto, {
      id: request.user.id,
      roleId: request.user.role.id,
    });
  }
}
