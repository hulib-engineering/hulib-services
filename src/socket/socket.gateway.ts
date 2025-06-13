import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import 'dotenv/config';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import ms from 'ms';

import { User } from '@users/domain/user';
import { Session } from '@session/domain/session';

import { SocketGuard } from './socket.guard';

import { CacheService } from '../cache/cache.service';
import { AuthService } from '@auth/auth.service';

// Extend Socket to include session properties
interface SocketWithSession
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
  session?: {
    id: User['id'];
    role: User['role'];
    sessionId: Session['id'];
  };
}

@WebSocketGateway(3003, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://hulib-fe-dev.vercel.app',
      'https://hulib.vercel.app',
      'https://www.hulib.org',
      'https://hulib.org',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept,Authorization,X-Requested-With',
    credentials: true,
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  readonly logger = new Logger(this.constructor.name);

  @WebSocketServer()
  private server: Server;

  private readonly clients: Map<string, Socket>;

  constructor(
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,
  ) {
    this.clients = new Map();
  }

  afterInit(): void {
    this.logger.log(`Websocket gateway initialized.`);
    this.server.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.headers['authorization'];
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
    console.log('New a client connected: ', socket?.id);
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

  @UseGuards(SocketGuard)
  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: SocketWithSession,
    @MessageBody() _message: any,
  ) {
    const socketSession = socket?.session;
    console.log('Connect session', socketSession);
    console.log(
      `Received message from client: ${socket?.id}.`,
      JSON.stringify(_message, null, 2),
      // _user,
    );
    socket.send('hello world');
  }

  @SubscribeMessage('ping')
  handlePing(socket: Socket) {
    socket.send('pong');
  }

  getClient(clientId: string): Socket | undefined {
    return this.clients?.get(clientId);
  }

  getAllClients() {
    return this.clients;
  }
}
