import {
  Controller,
  Get,
  UseGuards,
  Query,
  Request,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { omit } from 'lodash';

import { InfinityPaginationResponse } from '@utils/dto/infinity-pagination-response.dto';
import { User } from '@users/domain/user';
import { pagination } from '@utils/types/pagination';
import { UsersService } from '@users/users.service';
import { Story } from '@stories/domain/story';
import { Roles } from '@roles/roles.decorator';
import { RoleEnum } from '@roles/roles.enum';
import { RolesGuard } from '@roles/roles.guard';
import { PaginationInputDto } from '@utils/dto/pagination-input.dto';
import { infinityPagination } from '@utils/infinity-pagination';

import { ReportsService } from '../reports/reports.service';

import { ReportHuberDto } from './dto/report-huber.dto';
import { FindAllHubersDto } from './dto/find-all-hubers.dto';
import { CheckSessionAvailabilityDto } from './dto/check-session-availability.dto';
import { HubersService } from './hubers.service';

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
    private readonly reportService: ReportsService,
  ) {}

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(User),
  })
  async findAll(@Request() request, @Query() query: FindAllHubersDto) {
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

    const sanitizedData = data.map((user) => {
      const { file, ...rest } = user;
      return omit(
        {
          ...rest,
          photo: file,
        },
        ['password'],
      );
    });

    return pagination(sanitizedData, count, { page, limit });
  }

  @Get(':id/booked-sessions')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: Array<Date>,
  })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async getHuberBookedSessions(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Date[]> {
    const sessions = await this.hubersService.getHuberSessions(id);

    if (sessions && sessions.length > 0) {
      return sessions.map((session) => session.startedAt);
    }
    return [];
  }

  @Post(':id/validate-availability')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async validateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() checkSessionAvailabilityDto: CheckSessionAvailabilityDto,
  ): Promise<{ booked: boolean }> {
    let booked: boolean = false;
    if (!!checkSessionAvailabilityDto.startAt) {
      const sessions = await this.hubersService.getHuberSessions(id);

      if (
        sessions &&
        sessions.length > 0 &&
        sessions.some(
          (session) =>
            session.startedAt.getTime() ===
              new Date(checkSessionAvailabilityDto.startAt).getTime() &&
            (session.sessionStatus === 'pending' ||
              session.sessionStatus === 'approved'),
        )
      ) {
        booked = true;
      }
    }

    return { booked };
  }

  @Get(':id/stories')
  @Roles(RoleEnum.humanBook)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({
    type: InfinityPaginationResponse(Story),
  })
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  async getStories(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationInputDto,
  ) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(await this.hubersService.getStories(id), {
      page,
      limit,
    });
  }

  @Post(':id/reports')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async report(
    @Request() request,
    @Param('id', ParseIntPipe) id: number,
    @Body() reportHuberDto: ReportHuberDto,
  ) {
    const reporterId = request.user.id;

    return this.reportService.create(reporterId, {
      reason: reportHuberDto.reasons,
      reportedUserId: id,
    });
  }
}
