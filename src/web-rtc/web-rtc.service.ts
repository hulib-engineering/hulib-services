import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RtcRole, RtcTokenBuilder } from 'agora-token';

import { AllConfigType } from '@config/config.type';
import { ReadingSession } from '@reading-sessions/domain';

@Injectable()
export class WebRtcService {
  constructor(private configService: ConfigService<AllConfigType>) {}

  generateToken(
    sessionData: Pick<
      ReadingSession,
      'id' | 'humanBookId' | 'readerId' | 'story' | 'endedAt'
    >,
  ) {
    const appId = this.configService.getOrThrow('agora.appId', { infer: true }); // Replace it with your Agora App ID
    const appCertificate = this.configService.getOrThrow(
      'agora.appCertificate',
      {
        infer: true,
      },
    ); // Replace it with your Agora Certificate
    const channelName = `${sessionData.story.title}-${sessionData.id}`;
    // const uid = sessionData.id << 0;
    const role = RtcRole.PUBLISHER;
    const tokenExpired = 1800;
    const token = RtcTokenBuilder.buildTokenWithRtm(
      appId,
      appCertificate,
      channelName,
      0,
      role,
      tokenExpired,
      tokenExpired,
    );
    return { token, channelName };
  }
}
