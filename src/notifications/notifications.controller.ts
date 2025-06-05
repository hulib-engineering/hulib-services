import {
  Controller,
  Get,
  UseGuards,
  Query,
  Request,
  Post,
  Body,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Notification } from './domain/notification';
import { AuthGuard } from '@nestjs/passport';
import { InfinityPaginationResponse } from '../utils/dto/infinity-pagination-response.dto';
import { FindAllNotificationsDto } from './dto/find-all-notifications.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'notifications',
  version: '1',
})
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Notification),
  })
  async findAll(@Query() query: FindAllNotificationsDto, @Request() request) {
    const userId = request.user.id;

    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.notificationsService.findAllWithPagination({
        filterOptions: { recipientId: userId },
        paginationOptions: { limit, page },
      }),
      { page, limit },
    );
  }

  @Post()
  @ApiOperation({
    summary:
      'Create Notification. Add relatedEntityId for story notification types (reviewStory, publishStory) else it will be null',
  })
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  create(@Body() body: CreateNotificationDto) {
    return this.notificationsService.create(body);
  }
}
