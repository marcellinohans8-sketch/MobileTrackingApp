import { io } from 'socket.io-client';
import { LocationPoint } from '../domain/location';

export const SOCKET_URL = 'http://10.0.2.2:3000';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  transports: ['websocket'],
});

export function isSocketConnected() {
  return socket.connected;
}

export function sendLocation(data: LocationPoint | Omit<LocationPoint, 'id'>) {
  return new Promise<void>((resolve, reject) => {
    if (!socket.connected) {
      reject(new Error('Socket is offline'));
      return;
    }

    socket.timeout(5000).emit(
      'location:update',
      data,
      (error: Error | null, response?: {success?: boolean; message?: string}) => {
        if (error) {
          reject(error);
          return;
        }

        if (response?.success === false) {
          reject(new Error(response.message ?? 'Location sync rejected'));
          return;
        }

        resolve();
      },
    );
  });
}

export default socket;
