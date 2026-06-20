import { io } from 'socket.io-client';

const socket = io('http://YOUR_SERVER_IP:3000', {
  transports: ['websocket'],
});

export function sendLocation(data: any) {
  socket.emit('location:update', data);
}

export default socket;
