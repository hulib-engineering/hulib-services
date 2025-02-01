import { Controller, Get, Param, Query } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { Topics } from './domain/topics';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '@utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '@utils/infinity-pagination';
import { FindAllTopicsDto } from './dto/find-all-topics.dto';

@ApiTags('Topics')
@Controller({
  path: 'topics',
  version: '1',
})
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  // @Post()
  // @ApiCreatedResponse({
  //   type: Topics,
  // })
  // create(@Body() createTopicsDto: CreateTopicsDto) {
  //   return this.topicsService.create(createTopicsDto);
  // }

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
    type: Topics,
  })
  async findOne(@Param('id') id: number): Promise<Topics | null> {
    return await this.topicsService.findOne(id);
  }

  // @Patch(':id')
  // @ApiParam({
  //   name: 'id',
  //   type: Number,
  //   required: true,
  // })
  // @ApiOkResponse({
  //   type: Topics,
  // })
  // update(@Param('id') id: number, @Body() updateTopicsDto: UpdateTopicsDto) {
  //   return this.topicsService.update(id, updateTopicsDto);
  // }

  // @Delete(':id')
  // @ApiParam({
  //   name: 'id',
  //   type: Number,
  //   required: true,
  // })
  // remove(@Param('id') id: number) {
  //   return this.topicsService.remove(id);
  // }
}
