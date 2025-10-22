import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../config/env';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socket;
}


