import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import ms from 'ms';

import { CacheService } from '../cache/cache.service';
import { AuthService } from '@auth/auth.service';
import { User } from '@users/domain/user';
import { Session } from '@session/domain/session';

export const defaultCorsConfig = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://hulib-fe-dev.vercel.app',
    'https://hulib.vercel.app',
    'https://www.hulib.org',
    'https://hulib.org',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: [
    'Content-Type, Accept,Authorization,X-Requested-With',
    'baggage',
    'sentry-trace',
  ],
  credentials: true,
};

export interface SocketWithSession extends Socket {
  session?: {
    id: User['id'];
    role: User['role'];
    sessionId: Session['id'];
  };
}

export function getSocketToken(socket: Socket): string | undefined {
  const headerToken = socket.handshake.headers['authorization'];
  if (Array.isArray(headerToken)) {
    return headerToken[0];
  }
  if (headerToken) {
    return headerToken;
  }

  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === 'string') {
    return authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
  }

  const queryToken = socket.handshake.query?.token;
  if (Array.isArray(queryToken)) {
    const [token] = queryToken;
    return token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  if (typeof queryToken === 'string') {
    return queryToken.startsWith('Bearer ')
      ? queryToken
      : `Bearer ${queryToken}`;
  }

  return undefined;
}

export abstract class BaseSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  protected readonly logger = new Logger(this.constructor.name);

  @WebSocketServer()
  protected server: Server;

  protected readonly clients = new Map<string, Socket>();

  protected constructor(
    protected readonly authService: AuthService,
    protected readonly cacheService: CacheService,
  ) {
    this.clients = new Map();
  }

  protected setupAuthMiddleware(): void {
    this.server.use(async (socket: Socket, next) => {
      try {
        const token = getSocketToken(socket);
        const session = await this.authService.getSession(token);
        if (!session) {
          throw new Error();
        }
        socket['session'] = session;
        return next();
      } catch {
        return next(
          new UnauthorizedException({
            code: 'UNAUTHORIZED',
          }),
        );
      }
    });
  }

  async handleConnection(socket: SocketWithSession) {
    console.log('A new client connected: ', socket?.id);

    const userId = socket?.session?.id as string;
    if (!userId) {
      return;
    }
    this.clients.set(socket?.id, socket);
    const userClients = await this.cacheService.get<string[]>({
      key: 'UserSocketClients',
      args: [userId],
    });
    const clients = new Set<string>(Array.from(userClients ?? []));
    clients.add(socket?.id);
    await this.cacheService.set(
      { key: 'UserSocketClients', args: [userId] },
      Array.from(clients),
      { ttl: ms('1h') },
    );
  }

  async handleDisconnect(socket: SocketWithSession) {
    console.log('Client disconnected: ', socket?.id);
    this.clients.delete(socket?.id);
    const userId = socket?.session?.id as string;
    if (!userId) {
      return;
    }
    const userClients = await this.cacheService.get<string[]>({
      key: 'UserSocketClients',
      args: [userId],
    });
    const clients = new Set<string>(Array.from(userClients ?? []));
    if (clients.has(socket?.id)) {
      clients.delete(socket?.id);
      await this.cacheService.set(
        { key: 'UserSocketClients', args: [userId] },
        Array.from(clients),
        { ttl: ms('1h') },
      );
    }
  }
}
