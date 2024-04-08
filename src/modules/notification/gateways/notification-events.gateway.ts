import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import EVENTS from 'src/common/events.constants';

type IUserRoomSet = { socket: Socket; room: string };

@WebSocketGateway(81, { transports: ['websocket'], cors: '*' })
export class NotificationEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  // Todo: implement caching strategy to store and manage connected clients' userId
  private userSockets: Map<string, IUserRoomSet> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId as string;
    if (userId && userId !== undefined && userId !== 'undefined') {
      const userRoom = `${userId}`;
      this.userSockets.set(userId, { socket: client, room: userRoom });
      // console.log(`User ${userId} connected`);
      this.server.socketsJoin(userId);
      client.join(userRoom);
      // console.log(`User ${userId} joined ${userRoom}`);
    } else {
      // console.error('User ID not provided');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    let disconnectedUserId: string | undefined;
    this.userSockets.forEach((value, userId) => {
      if (value.socket === client) {
        disconnectedUserId = userId;
        this.userSockets.delete(userId);
        // console.log(`User ${userId} disconnected`);
      }
    });
    // console.log({ disconnectedUserId });
    if (disconnectedUserId) {
      const user = this.userSockets.get(disconnectedUserId);
      if (user) {
        user.socket.leave(user.room);
        // console.log(`User ${disconnectedUserId} left room ${user.room}`);
      }
    }
  }

  dispatchNotification({ payload, userId }: { userId: string; payload: any }) {
    const user = this.userSockets.get(userId);
    if (user) {
      const userRooms = user.socket.rooms;
      userRooms.forEach((room, key, set) => {
        if (key === userId) {
          user.socket.emit(EVENTS.NEW_CLIENT_NOTIFICATION, payload);
          console.log(`Notification sent to user (${userId})`);
        }
      });
    } else console.error(`Socket not found for user ${userId}`);
  }

  // private clients: Map<string, Socket> = new Map();

  // private subscribeToRoom(client: Socket, userId: string) {
  //   if (!this.clients.has(userId)) {
  //     this.clients.set(userId, client);
  //     const userClientSocket = this.clients.get(userId);
  //     userClientSocket.join(userId);
  //     console.log(`User ${userId} joined a room`);
  //     userClientSocket.rooms.forEach((room) => {
  //       let index = 1;
  //       console.log({ room: index++ + room });
  //     });
  //     console.log({
  //       updated: Array.from(this.clients.keys()),
  //       timestamp: new Date().toLocaleTimeString(),
  //     });
  //   }
  // }
  // handleConnection(client: Socket) {
  //   console.log('reconnected..', client.id);
  //   const userId = client.handshake.query.userId as string;
  //   const user = client.handshake.query.user;
  //   if (isString(userId) && isNotEmpty(userId) && userId !== 'undefined') {
  //     // console.log({ user: JSON.parse(user.toString()) });
  //     this.subscribeToRoom(client, userId);
  //   }
  // }

  // handleDisconnect(client: Socket) {
  //   console.log('disconnected..', client.id);
  //   this.clients.forEach((value, key) => {
  //     if (value === client) {
  //       console.log(`User ${key} disconnected`);
  //       this.clients.delete(key);
  //       console.log({
  //         updated: Array.from(this.clients.keys()),
  //         timestamp: new Date().toLocaleTimeString(),
  //       });
  //     }
  //   });
  // }

  // dispatchNotification(payload: Notification) {
  //   const { user, ...rest } = payload;
  //   const userClientSocket = this.clients.get(user.id);
  //   if (userClientSocket) {
  //     if (userClientSocket.handshake.query.userId === user.id) {
  //       // console.log({ userClientSocket: userClientSocket.rooms });
  //       userClientSocket.emit(EVENTS.NEW_CLIENT_NOTIFICATION, {
  //         notification: rest,
  //       });
  //       console.log(
  //         `Notification sent to user (${userClientSocket.handshake.query.userId})`,
  //       );
  //     }
  //   }
  // }
}
