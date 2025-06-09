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
import { CacheService } from '../cache/cache.service';
import { AuthGuard } from '@nestjs/passport';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

// Extend Socket to include session property
interface SocketWithSession
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
  session?: string;
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
    private readonly cacheService: CacheService,
    // private readonly betterAuthService: BetterAuthService,
  ) {
    this.clients = new Map();
  }

  afterInit(): void {
    this.logger.log(`Websocket gateway initialized.`);
    this.server.use((socket: Socket, next) => {
      try {
        const token = socket.handshake.headers['authorization']?.split(' ')[1];
        if (!token) {
          throw new Error();
        }
        socket['session'] = token;
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

  async handleConnection() {
    // console.log('New a client connected: ', socket?.id);
    // const userId = socket?.session?.user?.id as string;
    // if (!userId) {
    //   return;
    // }
    // this.clients.set(socket?.id, socket);
    // const userClients = await this.cacheService.get<string[]>({
    //   key: 'UserSocketClients',
    //   args: [userId],
    // });
    // const clients = new Set<string>(Array.from(userClients ?? []));
    // clients.add(socket?.id);
    // await this.cacheService.set(
    //   { key: 'UserSocketClients', args: [userId] },
    //   Array.from(clients),
    //   { ttl: ms('1h') },
    // );
  }

  async handleDisconnect() {
    // console.log('Client disconnected: ', socket?.id);
    // this.clients.delete(socket?.id);
    // const userId = socket?.session?.user?.id as string;
    // if (!userId) {
    //   return;
    // }
    // const userClients = await this.cacheService.get<string[]>({
    //   key: 'UserSocketClients',
    //   args: [userId],
    // });
    // const clients = new Set<string>(Array.from(userClients ?? []));
    // if (clients.has(socket?.id)) {
    //   clients.delete(socket?.id);
    //   await this.cacheService.set(
    //     { key: 'UserSocketClients', args: [userId] },
    //     Array.from(clients),
    //     { ttl: ms('1h') },
    //   );
    // }
  }

  @UseGuards(AuthGuard('jwt'))
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
