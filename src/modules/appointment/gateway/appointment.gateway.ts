import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import EVENTS from 'src/common/events.constants';

type IUserRoomSet = { socket: Socket; room: string };

@WebSocketGateway(81, {
  namespace: 'appointments',
  transports: ['websocket'],
  cors: '*',
})
export class AppointmentSessionGateway implements OnGatewayConnection {
  //   ,
  //    OnGatewayDisconnect{
  @WebSocketServer() server: Server;

  // Todo: use redis to cache the sessions
  // private sessionSockets: Map<string, IUserRoomSet> = new Map();

  handleConnection(client: Socket) {
    const authToken = client.handshake.auth.token;
    if (authToken !== 123) {
      client.emit('forbidden_request', { message: 'Forbidden request' });
      return;
    }
    client.on('create_session', (data) => {
      client.join(data.sessionId);
      if (!data.is_mentor) {
        // const sessionKey = 'sessionKey-sessionKey';
        // if (sessionKey !== data.sessionKey) {
        this.server.to(data.sessionId).emit('forbidden_request', {
          message: 'Action Not Allowed',
          data: {},
        });
        return;
        // }
      }
      this.server
        .to(data.sessionId)
        .emit('session_created', { message: 'success', data });
    });

    client.on('request_to_join_session', (data) => {
      client.join(data.sessionId);
      const sessionKey = 'sessionKey-sessionKey';
      if (data.is_mentor) {
        // const sessionKey = 'sessionKey-sessionKey';
        // if (sessionKey !== data.sessionKey) {
        this.server.to(data.sessionId).emit('forbidden_request', {
          message: 'Action Not Allowed',
          data: {},
        });
        return;
        // }
      } else if (sessionKey !== data.sessionKey) {
        this.server.to(data.sessionId).emit('forbidden_request', {
          message: 'Invalid Session Key',
          data: {},
        });
        return;
      }
      this.server
        .to(data.sessionId)
        .emit('request_to_join_session', { message: 'success', data });
    });

    client.on('request_rejected', (data) => {
      // if (data.is_mentor)
      this.server
        .to(data.sessionId)
        .emit('request_rejected', { message: 'Request Denied' });
    });

    client.on('accept_request', (data) => {
      client.join(data.sessionId);
      const sessionKey = 'sessionKey-sessionKey';
      if (sessionKey !== data.sessionKey) {
        this.server.to(data.sessionId).emit('forbidden_request', {
          message: 'Invalid Session Key',
          data: {},
        });
        return;
      }
      this.server
        .to(data.sessionId)
        .emit('request_accepted', { message: 'success', data });
    });
  }
}
