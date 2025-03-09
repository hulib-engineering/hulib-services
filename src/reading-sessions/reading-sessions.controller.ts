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
} from '@nestjs/common';
import { ReadingSessionsService } from './reading-sessions.service';
import { CreateReadingSessionDto } from './dto/reading-session/create-reading-session.dto';
import { UpdateReadingSessionDto } from './dto/reading-session/update-reading-session.dto';
import { CreateReadingSessionParticipantDto } from './dto/reading-session-participant/create-reading-session-participant.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CaslGuard } from '@casl/guards/casl.guard';
import { CheckAbilities } from '@casl/decorators/casl.decorator';
import { Action } from '@casl/ability.factory';

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
  @CheckAbilities((ability) => ability.can(Action.Create, 'ReadingSession'))
  createSession(@Request() request, @Body() dto: CreateReadingSessionDto) {
    const hostId = request?.user?.id;
    return this.readingSessionsService.createSession({
      ...dto,
      hostId,
    });
  }

  @Get()
  @CheckAbilities((ability) => ability.can(Action.Read, 'ReadingSession'))
  findAllSessions(@Request() request) {
    const hostId = request?.user?.id;
    return this.readingSessionsService.findAllSessions({
      hostId,
    });
  }

  @Get(':id')
  @CheckAbilities((ability) => ability.can(Action.Read, 'ReadingSession'))
  findOneSession(@Request() request, @Param('id') id: string) {
    const hostId = request?.user?.id;
    return this.readingSessionsService.findOneSession(id, hostId);
  }

  @Put(':id')
  @CheckAbilities((ability) => ability.can(Action.Update, 'ReadingSession'))
  updateSession(
    @Request() request,
    @Param('id') id: string,
    @Body() dto: UpdateReadingSessionDto,
  ) {
    const hostId = request?.user?.id;
    return this.readingSessionsService.updateSession(id, hostId, dto);
  }

  @Delete(':id')
  @CheckAbilities((ability) => ability.can(Action.Delete, 'ReadingSession'))
  deleteSession(@Request() request, @Param('id') id: string) {
    const hostId = request?.user?.id;
    return this.readingSessionsService.deleteSession(id, hostId);
  }

  @Post('participants')
  @CheckAbilities((ability) =>
    ability.can(Action.Create, 'ReadingSessionParticipant'),
  )
  addParticipant(
    @Request() request,
    @Body() dto: CreateReadingSessionParticipantDto,
  ) {
    const hostId = request.user.id;
    return this.readingSessionsService.addParticipant(dto, hostId);
  }

  @Get('participants')
  @CheckAbilities((ability) =>
    ability.can(Action.Read, 'ReadingSessionParticipant'),
  )
  findAllParticipants(@Request() request) {
    const hostId = request.user.id;
    return this.readingSessionsService.findAllParticipants(hostId);
  }
}
