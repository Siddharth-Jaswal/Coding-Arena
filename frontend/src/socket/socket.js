import { io } from 'socket.io-client';
import { SOCKET_URL, SOCKET_OPTIONS } from './socketConfig';

let socketInstance = null;

export const initializeSocket = (token) => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      ...SOCKET_OPTIONS,
      auth: { token }
    });
  } else {
    // If we reconnect with a new token (e.g. login as different user)
    socketInstance.auth = { token };
  }
  
  if (socketInstance.disconnected) {
    socketInstance.connect();
  }
  
  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
