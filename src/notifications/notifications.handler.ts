import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class NotificationsHandler {
  handleConnect(client: Socket) {
    console.log(`[NOTIFY] Connected: ${client.id}`);
    client.emit('notify:connected', 'You are now listening for notifications.');
  }

  handleDisconnect(client: Socket) {
    console.log(`[NOTIFY] Disconnected: ${client.id}`);
  }
}
