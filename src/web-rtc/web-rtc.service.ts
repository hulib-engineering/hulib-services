import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RtcRole, RtcTokenBuilder } from 'agora-token';

import { AllConfigType } from '@config/config.type';
import { ReadingSession } from '@reading-sessions/domain';
import { UsersService } from '@users/users.service';

@Injectable()
export class WebRtcService {
  constructor(
    private configService: ConfigService<AllConfigType>,
    private readonly usersService: UsersService,
  ) {}

  async generateToken(
    sessionData: Pick<
      ReadingSession,
      'id' | 'humanBookId' | 'readerId' | 'story' | 'endedAt' | 'startedAt'
    >,
  ) {
    const liber = await this.usersService.findById(sessionData.readerId);
    const huber = await this.usersService.findById(sessionData.readerId);

    const appId = this.configService.getOrThrow('agora.appId', { infer: true }); // Replace it with your Agora App ID
    const appCertificate = this.configService.getOrThrow(
      'agora.appCertificate',
      {
        infer: true,
      },
    ); // Replace it with your Agora Certificate
    // const channelName = `${sessionData.story.title}-${sessionData.id}`;
    const role = RtcRole.PUBLISHER;
    const expiredTime =
      sessionData.startedAt.getTime() - new Date().getTime() + 1800;
    const token = RtcTokenBuilder.buildTokenWithUserAccount(
      appId,
      appCertificate,
      sessionData.id.toString(),
      huber?.email + '-' + liber?.email,
      role,
      expiredTime,
      expiredTime,
    );
    return { token };
  }
}
