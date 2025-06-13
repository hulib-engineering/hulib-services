import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { OrNeverType } from '@utils/types/or-never.type';
import { JwtPayloadType } from './types/jwt-payload.type';
import { AllConfigType } from '@config/config.type';
import { SessionService } from '@session/session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService<AllConfigType>,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth.secret', { infer: true }),
    });
  }

  public async validate(
    payload: JwtPayloadType,
  ): Promise<OrNeverType<JwtPayloadType>> {
    if (!payload.id) {
      throw new UnauthorizedException();
    }

    if (!payload.sessionId) {
      throw new UnauthorizedException('Invalid token: Missing session ID.');
    }

    const session = await this.sessionService.findById(payload.sessionId);

    if (!session) {
      throw new UnauthorizedException('Session does not exist or has expired.');
    }

    return payload;
  }
}
