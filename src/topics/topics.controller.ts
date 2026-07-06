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
  UseGuards,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import {
  ApiBearerAuth,
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
import { TopicQueryTypeEnum } from '@topics/topic-query-type.enum';
import { AuthGuard } from '@nestjs/passport';
import { CheckAbilities } from '@casl/decorators/casl.decorator';
import { Action } from '@casl/ability.factory';
import { CaslGuard } from '@casl/guards/casl.guard';
import { pagination } from '@utils/pagination';
import { RoleEnum } from '@roles/roles.enum';

@ApiTags('Topics')
@ApiBearerAuth()
@Controller({
  path: 'topics',
  version: '1',
})
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  @CheckAbilities((ability) => ability.can(Action.Manage, 'Topic'))
  @UseGuards(AuthGuard('jwt'), CaslGuard)
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
    @Request() request,
    @Query() query: FindAllTopicsDto,
  ): Promise<
    InfinityPaginationResponseDto<Topics> | { data: Topics[]; meta: object }
  > {
    if (query?.type === TopicQueryTypeEnum.MOST_POPULAR) {
      return infinityPagination(await this.topicsService.findTop3Popular(), {
        page: 1,
        limit: 3,
      });
    }

    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const name = query?.name;
    const currentUser = request.user;
    const isAdmin = currentUser?.role?.id === RoleEnum.admin;

    const { data, total } = await this.topicsService.findAllWithPagination({
      paginationOptions: {
        page,
        limit,
      },
      name,
      user: currentUser,
    });

    if (isAdmin) {
      return pagination(data, total, { page, limit });
    }

    return infinityPagination(data, { page, limit });
  }

  @Get(':id')
  @CheckAbilities((ability) => ability.can(Action.Read, 'Topic'))
  @UseGuards(AuthGuard('jwt'), CaslGuard)
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: TopicDto,
  })
  async findOne(
    @Request() request,
    @Param('id') id: number,
  ): Promise<Topics | null> {
    return await this.topicsService.findOne(id, request.user);
  }

  @Patch(':id')
  @CheckAbilities((ability) => ability.can(Action.Manage, 'Topic'))
  @UseGuards(AuthGuard('jwt'), CaslGuard)
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
  @CheckAbilities((ability) => ability.can(Action.Manage, 'Topic'))
  @UseGuards(AuthGuard('jwt'), CaslGuard)
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
