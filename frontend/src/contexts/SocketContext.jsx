import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { initializeSocket, disconnectSocket, getSocket } from '@/socket/socket';
import { SOCKET_STATUS } from '@/socket/events';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState(SOCKET_STATUS.DISCONNECTED);

  useEffect(() => {
    let socket = null;

    if (isAuthenticated) {
      const token = localStorage.getItem('arena_token');
      if (!token) return;

      setStatus(SOCKET_STATUS.CONNECTING);
      socket = initializeSocket(token);

      socket.on('connect', () => {
        setStatus(SOCKET_STATUS.CONNECTED);
      });

      socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
          // Server disconnected us manually (e.g., auth failure)
          setStatus(SOCKET_STATUS.AUTH_FAILED);
        } else {
          setStatus(SOCKET_STATUS.DISCONNECTED);
        }
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connect_error:', err.message);
        setStatus(SOCKET_STATUS.RECONNECTING);
      });

    } else {
      // User is logged out, disconnect
      disconnectSocket();
      setStatus(SOCKET_STATUS.DISCONNECTED);
    }

    return () => {
      // Do not fully disconnect on unmount of provider to keep singleton alive
      // across fast refreshes, but remove generic listeners if needed.
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
      }
    };
  }, [isAuthenticated]);

  const value = {
    socket: getSocket(),
    status,
    isConnected: status === SOCKET_STATUS.CONNECTED,
    isReconnecting: status === SOCKET_STATUS.RECONNECTING,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
