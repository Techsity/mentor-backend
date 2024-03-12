import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { isNotEmpty, isString } from 'class-validator';
import { Server, Socket } from 'socket.io';
import { Notification } from 'src/modules/notification/entities/notification.entity';

@WebSocketGateway(81, { transports: ['websocket'], cors: '*' })
export class NotificationEventsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  constructor() {}
  // Todo: implement caching strategy to store and manage connected clients' userId as rooms for sending notification to them specifically
  private clients: string[] = [];
  private subscribeToRoom(userId: string) {
    if (!this.clients.includes(userId)) this.clients.push(userId);
    console.log({ updated: this.clients });
  }

  handleConnection(client: Socket, payload: any) {
    const userId = client.handshake.query.userId as string;
    console.log('Client connected:', {
      clientId: client.id,
      payload,
      userId: userId,
    });
    if (isString(userId) && isNotEmpty(userId) && userId !== undefined)
      this.subscribeToRoom(userId);
  }

  dispatchNotification(payload: Notification) {
    const { userId } = payload;
    const userClientRoom = this.clients.find((user) => user === userId);
    console.log({ notificationEventPayload: payload, userClientRoom });
    // send notification to user's room using socket server
  }
}
