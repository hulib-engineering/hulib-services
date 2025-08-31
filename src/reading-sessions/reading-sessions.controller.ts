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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiParam,
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
  @Roles(RoleEnum.reader, RoleEnum.humanBook)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Create a new reading session' })
  @ApiCreatedResponse({
    type: ReadingSession,
  })
  async create(@Body() dto: CreateReadingSessionDto) {
    return this.readingSessionsService.createSession(dto);
  }

  @ApiOperation({ summary: 'Query many reading sessions' })
  @ApiResponse({ type: [ReadingSessionResponseDto] })
  @Get()
  @CheckAbilities((ability) => ability.can(Action.Read, 'ReadingSession'))
  @UseGuards(AuthGuard('jwt'), CaslGuard)
  async findAllSessions(
    @Query() queryDto: FindAllReadingSessionsQueryDto,
    @Request() request,
  ): Promise<ReadingSessionResponseDto[]> {
    return this.readingSessionsService.findAllSessions(
      queryDto,
      request.user.id,
    );
  }

  @ApiResponse({ type: ReadingSessionResponseDto })
  @SerializeOptions({
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

  @ApiOperation({
    summary:
      'Update a reading session status (finished | unInitialized | canceled | pending | rejected | approved)',
  })
  @ApiResponse({ type: ReadingSessionResponseDto })
  @Patch(':id')
  async updateSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReadingSessionDto,
  ) {
    return this.readingSessionsService.updateSession(id, dto);
  }

  @ApiOperation({ summary: 'Delete a reading session' })
  @Delete(':id')
  async deleteSession(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.readingSessionsService.deleteSession(id);
  }
}
