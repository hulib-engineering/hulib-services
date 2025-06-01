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
import { notificationsService } from './notifications.service';
import { CreatenotificationDto } from './dto/create-notification.dto';
import { UpdatenotificationDto } from './dto/update-notification.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { notification } from './domain/notification';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllnotificationsDto } from './dto/find-all-notifications.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'notifications',
  version: '1',
})
export class notificationsController {
  constructor(private readonly notificationsService: notificationsService) {}

  @Post()
  @ApiCreatedResponse({
    type: notification,
  })
  create(@Body() createnotificationDto: CreatenotificationDto) {
    return this.notificationsService.create(createnotificationDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(notification),
  })
  async findAll(
    @Query() query: FindAllnotificationsDto,
  ): Promise<InfinityPaginationResponseDto<notification>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.notificationsService.findAllWithPagination({
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
    type: notification,
  })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: notification,
  })
  update(
    @Param('id') id: string,
    @Body() updatenotificationDto: UpdatenotificationDto,
  ) {
    return this.notificationsService.update(id, updatenotificationDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
