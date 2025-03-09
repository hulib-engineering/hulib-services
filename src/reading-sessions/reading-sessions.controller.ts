import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ReadingSessionsService } from './reading-sessions.service';
import { CreateReadingSessionDto } from './dto/reading-session/create-reading-session.dto';
import { UpdateReadingSessionDto } from './dto/reading-session/update-reading-session.dto';
import { CreateReadingSessionParticipantDto } from './dto/reading-session-participant/create-reading-session-participant.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Reading Sessions')
@ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'reading-sessions',
  version: '1',
})
export class ReadingSessionsController {
  constructor(
    private readonly readingSessionsService: ReadingSessionsService,
  ) {}

  @Post()
  createSession(@Request() request, @Body() dto: CreateReadingSessionDto) {
    const userId = request?.user?.id;
    if (!userId) {
      throw new BadRequestException('User not found');
    }
    return this.readingSessionsService.createSession({
      ...dto,
      hostId: userId,
    });
  }

  @Get()
  findAllSessions() {
    return this.readingSessionsService.findAllSessions();
  }

  @Get(':id')
  findOneSession(@Param('id') id: string) {
    return this.readingSessionsService.findOneSession(id);
  }

  @Put(':id')
  updateSession(@Param('id') id: string, @Body() dto: UpdateReadingSessionDto) {
    return this.readingSessionsService.updateSession(id, dto);
  }

  @Delete(':id')
  deleteSession(@Param('id') id: string) {
    return this.readingSessionsService.deleteSession(id);
  }

  @Post('participants')
  addParticipant(@Body() dto: CreateReadingSessionParticipantDto) {
    return this.readingSessionsService.addParticipant(dto);
  }

  @Get('participants')
  findAllParticipants() {
    return this.readingSessionsService.findAllParticipants();
  }
}
