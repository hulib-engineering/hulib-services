import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { AppealsService } from './appeals.service';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { ReviewAppealDto } from './dto/review-appeal.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Appeal } from './domain/appeal';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@roles/roles.guard';
import { Roles } from '@roles/roles.decorator';
import { RoleEnum } from '@roles/roles.enum';

@ApiTags('Appeals')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'appeals',
  version: '1',
})
export class AppealsController {
  constructor(private readonly appealsService: AppealsService) {}

  @Post()
  @Roles(RoleEnum.humanBook)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new appeal',
    description:
      'Submit an appeal against a moderation action. Users can only appeal moderation actions against their own account.',
  })
  @ApiCreatedResponse({
    type: Appeal,
    description: 'Appeal successfully created',
  })
  create(@Body() createAppealDto: CreateAppealDto, @Request() request) {
    const userId = request.user.id;
    return this.appealsService.create(userId, createAppealDto);
  }

  @Get(':id')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get appeal details by ID',
    description:
      'Retrieve details of a specific appeal. Users can only view their own appeals. Admins can view any appeal.',
  })
  @ApiOkResponse({
    type: Appeal,
    description: 'Appeal details retrieved successfully',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() request) {
    const userId = request.user.id;
    const isAdmin = request.user.role?.id === RoleEnum.admin;
    return this.appealsService.findOne(id, userId, isAdmin);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Review an appeal (Admin only)',
    description:
      'Accept or reject a pending appeal. If accepted, the related moderation will be reversed.',
  })
  @ApiOkResponse({
    type: Appeal,
    description: 'Appeal successfully reviewed',
  })
  reviewAppeal(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewAppealDto: ReviewAppealDto,
  ) {
    return this.appealsService.reviewAppeal(id, reviewAppealDto);
  }
}
