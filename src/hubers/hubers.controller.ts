import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { HubersService } from './hubers.service';

import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InfinityPaginationResponse } from '@utils/dto/infinity-pagination-response.dto';

import { FindAllHubersDto } from './dto/find-all-hubers.dto';
import { User } from '@users/domain/user';
import { pagination } from '@utils/types/pagination';

@ApiTags('Hubers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'hubers',
  version: '1',
})
export class HubersController {
  constructor(private readonly hubersService: HubersService) {}

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(User),
  })
  async findAll(@Query() query: FindAllHubersDto) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    console.log('Topic', query?.topicId);

    const [data, count] = await this.hubersService.queryHubers({
      filterOptions: { sharingTopic: query?.topicId },
      paginationOptions: {
        page,
        limit,
      },
    });

    return pagination(data, count, { page, limit });
  }
}
