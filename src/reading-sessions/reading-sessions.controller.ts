import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
  Query,
  ParseIntPipe,
  Patch,
  UseGuards,
  SerializeOptions,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ReadingSessionsService } from './reading-sessions.service';
import { CreateReadingSessionDto } from './dto/reading-session/create-reading-session.dto';
import { UpdateReadingSessionDto } from './dto/reading-session/update-reading-session.dto';
import { FindAllReadingSessionsQueryDto } from './dto/reading-session/find-all-reading-sessions-query.dto';
import {
  ReadingSessionResponseDto,
  ReadingSessionResponseDtoWithRelations,
} from './dto/reading-session/reading-session-response.dto';
import { ReadingSession } from '@reading-sessions/domain';
import { omit } from 'lodash';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@roles/roles.guard';
import { RoleEnum } from '@roles/roles.enum';
import { Roles } from '@roles/roles.decorator';
import { CheckAbilities } from '@casl/decorators/casl.decorator';
import { Action } from '@casl/ability.factory';
import { CaslGuard } from '@casl/guards/casl.guard';

@ApiTags('Reading Sessions')
@ApiBearerAuth()
@Controller({
  path: 'reading-sessions',
  version: '1',
})
export class ReadingSessionsController {
  constructor(
    private readonly readingSessionsService: ReadingSessionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reading session' })
  @ApiCreatedResponse({
    type: ReadingSession,
  })
  async create(@Body() dto: CreateReadingSessionDto) {
    return this.readingSessionsService.createSession(dto);
  }

  @Get()
  @Roles(RoleEnum.reader, RoleEnum.humanBook, RoleEnum.admin)
  @CheckAbilities((ability) => ability.can(Action.Read, 'ReadingSession'))
  @UseGuards(AuthGuard('jwt'), RolesGuard, CaslGuard)
  @ApiOperation({ summary: 'Query many reading sessions' })
  @ApiResponse({ type: [ReadingSessionResponseDto] })
  async findAllSessions(
    @Query() queryDto: FindAllReadingSessionsQueryDto,
    @Request() request,
  ): Promise<ReadingSessionResponseDto[]> {
    return this.readingSessionsService.findAllSessions({
      ...queryDto,
      userId: request.user.id,
    });
  }

  @SerializeOptions({
    excludePrefixes: ['__'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Find all reading sessions of current user' })
  @Get(':id')
  @ApiOperation({ summary: 'Find one reading session' })
  @ApiResponse({ type: ReadingSessionResponseDto })
  async findOneSession(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReadingSessionResponseDtoWithRelations> {
    const readingSession = await this.readingSessionsService.findOneSession(id);
    return omit(readingSession, [
      'humanBookId',
      'readerId',
      'storyId',
    ]) as ReadingSessionResponseDtoWithRelations;
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Update a reading session status (finished | unInitialized | canceled | pending | rejected | approved)',
  })
  @ApiResponse({ type: ReadingSessionResponseDto })
  async updateSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReadingSessionDto,
  ): Promise<ReadingSessionResponseDto> {
    return this.readingSessionsService.updateSession(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reading session' })
  async deleteSession(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.readingSessionsService.deleteSession(id);
  }
}
