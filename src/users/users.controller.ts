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
  Request,
  Put,
  Req,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@roles/roles.decorator';
import { RoleEnum } from '@roles/roles.enum';
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
import { GetAuthorDetailByIdDto } from './dto/get-author-detail-by-id.dto';
import { UpgradeDto } from './dto/upgrade.dto';
import { CaslGuard } from '@casl/guards/casl.guard';
import { CheckAbilities } from '@casl/decorators/casl.decorator';
import { Action } from '@casl/ability.factory';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
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
  })
  @Get()
  @Roles(RoleEnum.admin)
  @CheckAbilities((ability) => ability.can(Action.Read, 'User'))
  @UseGuards(AuthGuard('jwt'), RolesGuard, CaslGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryUserDto,
    @Request() request,
  ): Promise<InfinityPaginationResponseDto<User>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const userId = request?.user?.id;
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const topicsOfInterest = user.topics?.map((topic) => topic.id);

    return infinityPagination(
      await this.usersService.findManyWithPagination({
        filterOptions: {
          ...query?.filters,
          topicsOfInterest,
        },
        sortOptions: query?.sort,
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @ApiOkResponse({
    type: User,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @SerializeOptions({
    groups: ['admin'],
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
  update(
    @Param('id') id: User['id'],
    @Body() updateProfileDto: UpdateUserDto,
  ): Promise<User | null> {
    return this.usersService.update(id, updateProfileDto);
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

  // public id
  @ApiOkResponse({ type: GetAuthorDetailByIdDto })
  @Get('author/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  async getAuthorDetailById(
    @Param('id') id: User['id'],
  ): Promise<GetAuthorDetailByIdDto> {
    return this.usersService.getAuthorDetailById(id);
  }

  @ApiOkResponse({
    type: User,
  })
  @Put('update-profile')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @Request() request,
    @Body() updateProfileDto: UpdateUserDto,
  ): Promise<User | null> {
    console.log('request.user.id', request.user.id);
    return this.usersService.update(request.user.id, updateProfileDto);
  }

  @Patch('upgrade/:id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  upgrade(
    @Param('id') id: User['id'],
    @Body() { action }: UpgradeDto,
  ): Promise<User | { message: string } | void> {
    return this.usersService.upgrade(id, action);
  }
}
