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
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Topics } from './domain/topics';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '@utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '@utils/infinity-pagination';
import { FindAllTopicsDto } from './dto/find-all-topics.dto';
import { CreateTopicsDto } from './dto/create-topics.dto';
import { TopicDto } from './dto/topic.dto';
import { UpdateTopicsDto } from './dto/update-topics.dto';

@ApiTags('Topics')
@Controller({
  path: 'topics',
  version: '1',
})
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiCreatedResponse({
    type: TopicDto,
  })
  async create(@Body() dto: CreateTopicsDto) {
    return this.topicsService.create(dto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Topics),
  })
  async findAll(
    @Query() query: FindAllTopicsDto,
  ): Promise<InfinityPaginationResponseDto<Topics>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const name = query?.name;

    return infinityPagination(
      await this.topicsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
        name,
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
    type: TopicDto,
  })
  async findOne(@Param('id') id: number): Promise<Topics | null> {
    return await this.topicsService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: TopicDto,
  })
  update(@Param('id') id: number, @Body() updateTopicsDto: UpdateTopicsDto) {
    return this.topicsService.update(id, updateTopicsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a topic' })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  async deleteTopic(@Param('id', ParseIntPipe) id: number) {
    return this.topicsService.remove(id);
  }
}
