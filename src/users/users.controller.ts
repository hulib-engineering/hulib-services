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
  HttpStatus,
  HttpCode,
  SerializeOptions,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '@utils/dto/infinity-pagination-response.dto';
import { NullableType } from '@utils/types/nullable.type';
import { QueryUserDto } from './dto/query-user.dto';
import { User } from './domain/user';
import { UsersService } from './users.service';
import { RolesGuard } from '@roles/roles.guard';
import { infinityPagination } from '@utils/infinity-pagination';
import { UpgradeDto } from './dto/upgrade.dto';

import { Roles } from '@roles/roles.decorator';
import { RoleEnum } from '@roles/roles.enum';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { GetUserReadingSessionsQueryDto } from './dto/get-user-reading-sessions-query.dto';
import { ReadingSessionResponseDto } from '@reading-sessions/dto/reading-session/reading-session-response.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({
    type: User,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Post()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createProfileDto);
  }

  @ApiOkResponse({
    type: InfinityPaginationResponse(User),
  })
  @SerializeOptions({
    groups: ['admin'],
    excludePrefixes: ['__'],
  })
  @Get()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryUserDto,
  ): Promise<InfinityPaginationResponseDto<User>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.usersService.findManyWithPagination({
        filterOptions: { role: query.role },
        sortOptions: query?.sort,
        paginationOptions: { page, limit },
      }),
      { page, limit },
    );
  }

  @ApiOkResponse({
    type: User,
  })
  @SerializeOptions({
    groups: ['admin'],
    excludePrefixes: ['__'],
  })
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  findOne(@Param('id') id: User['id']): Promise<NullableType<User>> {
    return this.usersService.findById(id);
  }

  @ApiOkResponse({
    type: User,
  })
  @Patch(':id')
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOperation({
    description: 'Update user status: ["active", "inactive", "under_warning"]',
  })
  update(
    @Param('id') id: User['id'],
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<User | null> {
    return this.usersService.updateStatus(id, updateUserStatusDto.status);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: User['id']): Promise<void> {
    return this.usersService.remove(id);
  }

  @ApiOkResponse({
    description: 'Approve request to become huber successfully.',
  })
  @ApiOkResponse({
    description: 'Reject request to become huber!',
  })
  @ApiOperation({
    summary:
      'Perform action to upgrade account to huber. Only admin can perform this action (accept | reject).',
  })
  @Post(':id/upgrade')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.OK)
  upgrade(
    @Param('id') id: User['id'],
    @Body() upgradeDto: UpgradeDto,
  ): Promise<User | { message: string } | void> {
    return this.usersService.upgrade(id, upgradeDto);
  }

  @ApiResponse({ type: ReadingSessionResponseDto })
  @SerializeOptions({
    groups: ['admin'],
    excludePrefixes: ['__'],
  })
  @Get(':id/reading-session')
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  getReadingSessions(
    @Param('id') id: User['id'],
    @Query() query: GetUserReadingSessionsQueryDto,
  ) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return this.usersService.getReadingSessions({
      userId: id,
      status: query.sessionStatus,
      paginationOptions: {
        page,
        limit,
      },
    });
  }
}
