import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { RolesGuard } from '@roles/roles.guard';
import { Roles } from '@roles/roles.decorator';
import { RoleEnum } from '@roles/roles.enum';

import { AgoraStartRecordingDto } from './dto/agora-start-recording.dto';
import { AgoraStopRecordingDto } from './dto/agora-stop-recording.dto';
import { WebRtcService } from './web-rtc.service';

@ApiBearerAuth()
@Roles(RoleEnum.humanBook, RoleEnum.reader)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Agora')
@Controller({
  path: 'agora',
  version: '1',
})
export class AgoraController {
  constructor(private readonly agoraService: WebRtcService) {}

  @Post('recording/start')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Start recording successfully.',
  })
  @HttpCode(HttpStatus.INTERNAL_SERVER_ERROR)
  @ApiInternalServerErrorResponse({
    description: 'Internal server error!',
  })
  async start(@Body() body: AgoraStartRecordingDto) {
    return this.agoraService.startRecording(body.channel);
  }

  @Post('recording/stop')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Stop recording successfully.',
  })
  @HttpCode(HttpStatus.INTERNAL_SERVER_ERROR)
  @ApiInternalServerErrorResponse({
    description: 'Internal server error!',
  })
  stop(
    @Body()
    body: AgoraStopRecordingDto,
  ) {
    return this.agoraService.stopRecording(
      body.resourceId,
      body.sid,
      body.channel,
      body.uid,
    );
  }
}
