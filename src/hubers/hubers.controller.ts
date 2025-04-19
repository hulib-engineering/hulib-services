import { Controller, Get, UseGuards, Query, Request } from '@nestjs/common';
import { HubersService } from './hubers.service';

import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InfinityPaginationResponse } from '@utils/dto/infinity-pagination-response.dto';

import { FindAllHubersDto } from './dto/find-all-hubers.dto';
import { User } from '@users/domain/user';
import { pagination } from '@utils/types/pagination';
import { UsersService } from '@users/users.service';

@ApiTags('Hubers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'hubers',
  version: '1',
})
export class HubersController {
  constructor(
    private readonly hubersService: HubersService,
    private readonly userService: UsersService,
  ) {}

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(User),
  })
  async findAll(
    @Request() request,
    @Query()
    query: FindAllHubersDto,
  ) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    const user = await this.userService.findById(request.user.id);
    const sharingTopics = query?.topicIds ?? [];
    if (limit > 50) {
      limit = 50;
    }

    const [data, count] = await this.hubersService.queryHubers({
      filterOptions: {
        sharingTopics,
        userTopicsOfInterest: user?.topics?.map((topic) => topic.id),
      },
      paginationOptions: {
        page,
        limit,
      },
    });

    return pagination(data, count, { page, limit });
  }
}
