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
      'id' | 'humanBookId' | 'readerId' | 'story' | 'endedAt' | 'startedAt'
    >,
  ) {
    const appId = this.configService.getOrThrow('agora.appId', { infer: true }); // Replace it with your Agora App ID
    const appCertificate = this.configService.getOrThrow(
      'agora.appCertificate',
      {
        infer: true,
      },
    ); // Replace it with your Agora Certificate
    const role = RtcRole.PUBLISHER;

    // Convert meeting start time to seconds
    const startSeconds = Math.floor(sessionData.startedAt.getTime() / 1000);

    // Token expiry = meeting start + 30 minutes
    const privilegeExpiredTs = startSeconds + 60 * 60;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      `session-${sessionData.id}`,
      0,
      role,
      privilegeExpiredTs, // RTC privilege expiry
      privilegeExpiredTs, // join privilege expiry (same as above)
    );
    return { token, expireAt: privilegeExpiredTs };
  }
}
