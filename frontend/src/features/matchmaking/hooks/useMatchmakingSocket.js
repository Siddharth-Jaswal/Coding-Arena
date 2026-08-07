import { useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useMatchmakingStore } from '../store/useMatchmakingStore';
import { CLIENT_EVENTS, SERVER_EVENTS } from '@/socket/events';

export const useMatchmakingSocket = () => {
  const { socket, isConnected } = useSocket();
  const store = useMatchmakingStore();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleQueueJoined = (payload) => {
      if (payload?.success) {
        store.setQueued();
      }
    };

    const handleQueueLeft = () => {
      store.setCancelled();
    };

    const handleMatchFound = (payload) => {
      store.setMatchFound(payload);
    };

    const handleError = (payload) => {
      store.setError(payload?.message || 'An unknown error occurred');
    };

    const handleRoomCreated = (payload) => {
      store.setRoomData(payload);
    };

    // Attach listeners
    socket.on(SERVER_EVENTS.QUEUE_JOINED, handleQueueJoined);
    socket.on(SERVER_EVENTS.QUEUE_LEFT, handleQueueLeft);
    socket.on(SERVER_EVENTS.MATCH_FOUND, handleMatchFound);
    socket.on(SERVER_EVENTS.ROOM_CREATED, handleRoomCreated);
    socket.on(SERVER_EVENTS.ERROR, handleError);

    return () => {
      // Detach listeners on unmount
      socket.off(SERVER_EVENTS.QUEUE_JOINED, handleQueueJoined);
      socket.off(SERVER_EVENTS.QUEUE_LEFT, handleQueueLeft);
      socket.off(SERVER_EVENTS.MATCH_FOUND, handleMatchFound);
      socket.off(SERVER_EVENTS.ROOM_CREATED, handleRoomCreated);
      socket.off(SERVER_EVENTS.ERROR, handleError);
    };
  }, [socket, isConnected, store]);

  // Expose callbacks for the UI to trigger
  const findMatch = useCallback(() => {
    if (!socket || !isConnected) {
      store.setError('Not connected to server');
      return;
    }
    store.setJoining();
    socket.emit(CLIENT_EVENTS.JOIN_QUEUE);
  }, [socket, isConnected, store]);

  const cancelSearch = useCallback(() => {
    if (!socket || !isConnected) return;
    socket.emit(CLIENT_EVENTS.LEAVE_QUEUE);
  }, [socket, isConnected]);

  return {
    findMatch,
    cancelSearch
  };
};
