import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CaslGuard } from '@casl/guards/casl.guard';
import { CheckAbilities } from '@casl/decorators/casl.decorator';
import { Action } from '@casl/ability.factory';
import { ReadingSessionsService } from './reading-sessions.service';
import { CreateReadingSessionDto } from './dto/reading-session/create-reading-session.dto';
import { UpdateReadingSessionDto } from './dto/reading-session/update-reading-session.dto';
import { FindAllReadingSessionsQueryDto } from './dto/reading-session/find-all-reading-sessions-query.dto';
import { ReadingSessionResponseDto } from './dto/reading-session/reading-session-response.dto';
import { ReadingSessionStatus } from './entities/reading-session.entity';

@ApiTags('Reading Sessions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), CaslGuard)
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
  @ApiResponse({ type: ReadingSessionResponseDto })
  @CheckAbilities((ability) => ability.can(Action.Create, 'ReadingSession'))
  async createSession(
    @Request() request,
    @Body() dto: CreateReadingSessionDto,
  ): Promise<ReadingSessionResponseDto> {
    return this.readingSessionsService.createSession(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all reading sessions' })
  @ApiResponse({ type: [ReadingSessionResponseDto] })
  @CheckAbilities((ability) => ability.can(Action.Read, 'ReadingSession'))
  async findAllSessions(
    @Query() queryDto: FindAllReadingSessionsQueryDto,
  ): Promise<ReadingSessionResponseDto[]> {
    return this.readingSessionsService.findAllSessions(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one reading session' })
  @ApiResponse({ type: ReadingSessionResponseDto })
  @CheckAbilities((ability) => ability.can(Action.Read, 'ReadingSession'))
  async findOneSession(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReadingSessionResponseDto> {
    return this.readingSessionsService.findOneSession(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a reading session' })
  @ApiResponse({ type: ReadingSessionResponseDto })
  @CheckAbilities((ability) => ability.can(Action.Update, 'ReadingSession'))
  async updateSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReadingSessionDto,
  ): Promise<ReadingSessionResponseDto> {
    return this.readingSessionsService.updateSession(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reading session' })
  @CheckAbilities((ability) => ability.can(Action.Delete, 'ReadingSession'))
  async deleteSession(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.readingSessionsService.deleteSession(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update reading session status' })
  @ApiResponse({ type: ReadingSessionResponseDto })
  @CheckAbilities((ability) => ability.can(Action.Update, 'ReadingSession'))
  async updateSessionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ReadingSessionStatus,
  ): Promise<ReadingSessionResponseDto> {
    return this.readingSessionsService.updateSessionStatus(id, status);
  }
}
