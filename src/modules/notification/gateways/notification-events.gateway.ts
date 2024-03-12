import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Notification } from 'src/modules/notification/entities/notification.entity';

@WebSocketGateway(81, { transports: ['websocket'], cors: '*' })
export class NotificationEventsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  constructor() {}

  handleConnection(client: Socket, payload: any) {
    const userId = client.handshake.query.userId as string;
    // Todo: implement caching strategy to store connected clients userId as rooms for sending notification to specific clients
    console.log('Client connected:', {
      clientId: client.id,
      payload,
      userId: userId,
    });
  }

  // @SubscribeMessage(EVENTS.NEW_COURSE_NOTIFICATION)
  dispatchNotification(payload: Notification) {
    console.log({ payload });
    return 'Hello world!';
  }
}
