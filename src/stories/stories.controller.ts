import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
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
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllStoriesDto } from './dto/find-all-stories.dto';

@ApiTags('Stories')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'stories',
  version: '1',
})
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

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
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.storiesService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
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

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: Story['id']) {
    return this.storiesService.remove(id);
  }

  @Get('details/:id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Story,
  })
  async getStoryDetails(@Param('id') id: number) {
    return this.storiesService.findDetailedStory(id);
  }
}
