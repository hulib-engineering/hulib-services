import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatTokenBuilder } from 'agora-token';

import { AllConfigType } from '@config/config.type';

interface TokenResult {
  token: string;
}

@Injectable()
export class ChatService {
  private readonly DEFAULT_TOKEN_EXPIRATION_TIME = 1800;

  constructor(private configService: ConfigService<AllConfigType>) {}

  private getAgoraConfig(): { appId: string; appCertificate: string } {
    const appId = this.configService.getOrThrow('agora.appId', { infer: true });
    const appCertificate = this.configService.getOrThrow(
      'agora.appCertificate',
      { infer: true },
    );
    return { appId, appCertificate };
  }

  generateAppToken(expirationTime?: number): TokenResult {
    const { appId, appCertificate } = this.getAgoraConfig();
    const expiresIn = expirationTime || this.DEFAULT_TOKEN_EXPIRATION_TIME;

    const token = ChatTokenBuilder.buildAppToken(
      appId,
      appCertificate,
      expiresIn,
    );
    return { token };
  }

  generateUserToken(userId: number, expirationTime?: number): TokenResult {
    const { appId, appCertificate } = this.getAgoraConfig();
    const expiresIn = expirationTime || this.DEFAULT_TOKEN_EXPIRATION_TIME;

    const token = ChatTokenBuilder.buildUserToken(
      appId,
      appCertificate,
      userId,
      expiresIn,
    );
    return { token };
  }
}
