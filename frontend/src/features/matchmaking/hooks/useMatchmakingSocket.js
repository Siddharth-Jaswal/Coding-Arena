import { useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useMatchmakingStore } from '../store/useMatchmakingStore';
import { CLIENT_EVENTS, SERVER_EVENTS } from '@/socket/events';

export const useMatchmakingSocket = () => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleQueueJoined = (payload) => {
      const { attemptId, setQueued } = useMatchmakingStore.getState();
      if (payload?.attemptId && attemptId && payload.attemptId !== attemptId) return;
      if (payload?.success) {
        setQueued();
      }
    };

    const handleQueueLeft = () => {
      useMatchmakingStore.getState().setCancelled();
    };

    const handleMatchFound = (payload) => {
      const { attemptId, setMatchFound } = useMatchmakingStore.getState();
      if (payload?.attemptId && attemptId && payload.attemptId !== attemptId) return;
      setMatchFound(payload);
    };

    const handleError = (payload) => {
      useMatchmakingStore.getState().setError(payload?.message || 'An unknown error occurred');
    };

    const handleRoomCreated = (payload) => {
      const { attemptId, setRoomData } = useMatchmakingStore.getState();
      if (payload?.attemptId && attemptId && payload.attemptId !== attemptId) return;
      setRoomData(payload);
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
  }, [socket, isConnected]);

  // Expose callbacks for the UI to trigger
  const findMatch = useCallback((mode = 'ranked') => {
    if (!socket || !isConnected) {
      useMatchmakingStore.getState().setError('Not connected to server');
      return;
    }
    const attemptId = crypto.randomUUID();
    useMatchmakingStore.getState().setJoining(attemptId, mode);
    socket.emit(CLIENT_EVENTS.JOIN_QUEUE, { attemptId, mode });
  }, [socket, isConnected]);

  const cancelSearch = useCallback(() => {
    if (!socket || !isConnected) return;
    socket.emit(CLIENT_EVENTS.LEAVE_QUEUE);
    useMatchmakingStore.getState().setCancelled();
  }, [socket, isConnected]);

  return {
    findMatch,
    cancelSearch
  };
};
