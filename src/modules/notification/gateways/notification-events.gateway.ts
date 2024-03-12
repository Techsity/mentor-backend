import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { isNotEmpty, isString } from 'class-validator';
import { Server, Socket } from 'socket.io';
import EVENTS from 'src/common/events.constants';
import { Notification } from 'src/modules/notification/entities/notification.entity';

@WebSocketGateway(81, { transports: ['websocket'], cors: '*' })
export class NotificationEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  // Todo: implement caching strategy to store and manage connected clients' userId as rooms for
  private clients: Map<string, Socket> = new Map();

  private subscribeToRoom(client: Socket, userId: string) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, client);
      const userClientSocket = this.clients.get(userId);
      userClientSocket.join(userId);
      console.log(`User ${userId} joined a private room`);
      console.log({
        updated: Array.from(this.clients.keys()),
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  }

  handleConnection(client: Socket) {
    console.log('reconnected..', client.id);
    const userId = client.handshake.query.userId as string;
    if (isString(userId) && isNotEmpty(userId) && userId !== 'undefined')
      this.subscribeToRoom(client, userId);
  }

  handleDisconnect(client: Socket) {
    console.log('disconnected..', client.id);
    this.clients.forEach((value, key) => {
      if (value === client) {
        console.log(`User ${key} disconnected`);
        this.clients.delete(key);
        console.log({
          updated: Array.from(this.clients.keys()),
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    });
  }

  dispatchNotification(payload: Notification) {
    const { user, ...rest } = payload;
    const userClientSocket = this.clients.get(user.id);
    // const {
    //   handshake: {
    //     query: { userId },
    //   },
    // } = userClientSocket;
    // console.log({ userClientSocket: userId });
    // if (userId === user.id)
    if (userClientSocket) {
      console.log({ userClientSocket });
      userClientSocket.to(user.id).emit(EVENTS.NEW_CLIENT_NOTIFICATION, {
        notification: rest,
      });
    }
  }
}
