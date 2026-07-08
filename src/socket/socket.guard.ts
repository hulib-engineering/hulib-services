import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { AuthService } from '@auth/auth.service';
import { getSocketToken } from './base-socket.gateway';

@Injectable()
export class SocketGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    if (context.getType() !== 'ws') {
      throw new WsException('Invalid context type. Expected "ws".');
    }
    const socket = context.switchToWs().getClient<Socket>();
    try {
      const currentSession = socket['session'];
      const session = await this.authService.getSession(getSocketToken(socket));
      socket['session'] = currentSession ?? session;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      socket.disconnect();
      throw new WsException('Unauthorized');
    }
    return true;
  }
}
