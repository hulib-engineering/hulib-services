import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  Patch,
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
import { ReadingSessionResponseDto } from './dto/reading-session/reading-session-response.dto';
import { ReadingSessionStatus } from './infrastructure/persistence/relational/entities/reading-session.entity';
import { ReadingSession } from '@reading-sessions/domain';

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
  @ApiOperation({ summary: 'Find all reading sessions' })
  @ApiResponse({ type: [ReadingSessionResponseDto] })
  async findAllSessions(
    @Query() queryDto: FindAllReadingSessionsQueryDto,
  ): Promise<ReadingSessionResponseDto[]> {
    return this.readingSessionsService.findAllSessions(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one reading session' })
  @ApiResponse({ type: ReadingSessionResponseDto })
  async findOneSession(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReadingSessionResponseDto> {
    return this.readingSessionsService.findOneSession(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a reading session status' })
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
