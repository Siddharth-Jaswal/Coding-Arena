import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { SERVER_EVENTS, CLIENT_EVENTS } from '@/socket/events';
import { useMatchmakingStore } from '@/features/matchmaking/store/useMatchmakingStore';

const MatchContext = createContext(null);

export const MatchProvider = ({ children, roomId }) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  
  // Initialize from matchmaking store if we just transitioned
  const storeOpponent = useMatchmakingStore(state => state.opponent);
  const storeMetadata = useMatchmakingStore(state => state.contestMetadata);

  const [room, setRoom] = useState(storeMetadata || null);
  const [opponent, setOpponent] = useState(storeOpponent || null);
  const [status, setStatus] = useState(storeMetadata?.status || 'waiting');
  const [scores, setScores] = useState(storeMetadata?.scores || {});
  const [events, setEvents] = useState([]);
  const [matchResult, setMatchResult] = useState(null);
  const [endsAt, setEndsAt] = useState(storeMetadata?.endsAt || null);
  const [activeProblemId, setActiveProblemId] = useState(
    storeMetadata?.problems?.[0]?.id || null
  );
  
  // Milestone 4D Additions
  const [countdownSeconds, setCountdownSeconds] = useState(null);
  const [solvedProblemIds, setSolvedProblemIds] = useState([]);
  const [attemptedProblemIds, setAttemptedProblemIds] = useState([]);
  const [winnerId, setWinnerId] = useState(null);

  // Emit JOIN_ROOM when socket connects
  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;
    socket.emit(CLIENT_EVENTS.JOIN_ROOM, { roomId });
  }, [socket, isConnected, roomId]);

  // Handle Socket Listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleRoomJoined = (payload) => {
      // Hydrate state if we loaded directly into the room
      if (payload.room) {
        setRoom(payload.room);
        setStatus(payload.room.status);
        setScores(payload.room.scores || {});
        if (payload.room.endsAt) setEndsAt(payload.room.endsAt);
        if (payload.room.winner) setWinnerId(payload.room.winner);
        
        // Find opponent
        if (user?.id) {
          const pIds = Object.keys(payload.room.players);
          const oppId = pIds.find(id => id !== user.id.toString());
          if (oppId) {
            setOpponent({ 
              id: oppId, 
              ...payload.room.players[oppId],
              disconnected: payload.room.players[oppId].disconnected || false
            });
          }

          // Hydrate solved problems from room state
          if (payload.room.solved && payload.room.solved[user.id]) {
            const solvedIds = Object.keys(payload.room.solved[user.id]);
            setSolvedProblemIds(solvedIds);
          }
        }
        
        // Set active problem if missing
        if (!activeProblemId && payload.room.problems?.length > 0) {
          setActiveProblemId(payload.room.problems[0].id);
        }
      }
      
      // Emit READY so the backend knows this player has loaded the room
      socket.emit(CLIENT_EVENTS.READY, { roomId });
    };

    const handleCountdownStarted = (payload) => {
      setStatus('countdown');
      setCountdownSeconds(payload.startsInSeconds || 3);
      setEvents(prev => [...prev, {
        type: 'system',
        message: `Match starting in ${payload.startsInSeconds} seconds...`,
        timestamp: Date.now()
      }]);
    };

    const handleContestStarted = (payload) => {
      setStatus('running');
      setCountdownSeconds(null);
      setEndsAt(payload.endsAt || new Date(Date.now() + (payload.durationSeconds * 1000)).toISOString());
      setEvents(prev => [...prev, {
        type: 'system',
        message: 'Match started! Good luck.',
        timestamp: Date.now()
      }]);
    };

    const handleScoreUpdated = (payload) => {
      // Payload structure from backend: { userId, problemId, verdict, pointsAwarded, newTotalScore }
      setScores(prev => ({ ...prev, [payload.userId]: payload.newTotalScore }));
      
      const isMe = payload.userId === user?.id;
      const actor = isMe ? 'me' : 'opponent';
      const actorName = isMe ? 'You' : (opponent?.username || 'Opponent');

      const pId = String(payload.problemId);

      if (payload.verdict === 'Accepted') {
        if (isMe) {
          setSolvedProblemIds(prev => [...new Set([...prev, pId])]);
          setAttemptedProblemIds(prev => prev.filter(id => id !== pId));
        }
      } else {
        if (isMe) {
          setAttemptedProblemIds(prev => {
            if (solvedProblemIds.includes(pId)) return prev;
            return [...new Set([...prev, pId])];
          });
        }
      }

      setEvents(prev => [...prev, {
        type: 'solve',
        user: actor,
        message: `${actorName} got ${payload.verdict} on a problem!`,
        timestamp: Date.now()
      }]);
    };

    const handleMatchFinished = (payload) => {
      setStatus('finished');
      setWinnerId(payload.winnerId);
      setMatchResult(payload);
      
      // Override local scores with final scores from backend
      if (payload.finalScores) {
          setScores(payload.finalScores);
      }
      
      setEvents(prev => [...prev, {
        type: 'system',
        message: `Match finished. ${payload.winnerId === user?.id ? 'You won!' : payload.winnerId ? 'You lost.' : 'Draw.'}`,
        timestamp: Date.now()
      }]);

      // Reset the matchmaking store now that we've preserved the result locally
      useMatchmakingStore.getState().reset();
    };

    const handlePlayerDisconnected = (payload) => {
      if (payload.userId === opponent?.id) {
        setOpponent(prev => ({ ...prev, disconnected: true }));
        setEvents(prev => [...prev, { type: 'system', message: 'Opponent disconnected.', timestamp: Date.now() }]);
      }
    };

    const handlePlayerReconnected = (payload) => {
      if (payload.userId === opponent?.id) {
        setOpponent(prev => ({ ...prev, disconnected: false }));
        setEvents(prev => [...prev, { type: 'system', message: 'Opponent reconnected.', timestamp: Date.now() }]);
      }
    };

    socket.on(SERVER_EVENTS.ROOM_JOINED, handleRoomJoined);
    socket.on(SERVER_EVENTS.COUNTDOWN_STARTED, handleCountdownStarted);
    socket.on(SERVER_EVENTS.CONTEST_STARTED, handleContestStarted);
    socket.on(SERVER_EVENTS.SCORE_UPDATED, handleScoreUpdated);
    socket.on(SERVER_EVENTS.MATCH_FINISHED, handleMatchFinished);
    socket.on(SERVER_EVENTS.PLAYER_DISCONNECTED, handlePlayerDisconnected);
    socket.on(SERVER_EVENTS.PLAYER_RECONNECTED, handlePlayerReconnected);

    return () => {
      socket.off(SERVER_EVENTS.ROOM_JOINED, handleRoomJoined);
      socket.off(SERVER_EVENTS.COUNTDOWN_STARTED, handleCountdownStarted);
      socket.off(SERVER_EVENTS.CONTEST_STARTED, handleContestStarted);
      socket.off(SERVER_EVENTS.SCORE_UPDATED, handleScoreUpdated);
      socket.off(SERVER_EVENTS.MATCH_FINISHED, handleMatchFinished);
      socket.off(SERVER_EVENTS.PLAYER_DISCONNECTED, handlePlayerDisconnected);
      socket.off(SERVER_EVENTS.PLAYER_RECONNECTED, handlePlayerReconnected);
    };
  }, [socket, isConnected, roomId, opponent?.id, opponent?.username, user?.id, activeProblemId]);

  const value = {
    roomId,
    room,
    opponent,
    status,
    scores,
    events,
    endsAt,
    activeProblemId,
    setActiveProblemId,
    countdownSeconds,
    solvedProblemIds,
    attemptedProblemIds,
    winnerId,
    matchResult
  };

  return (
    <MatchContext.Provider value={value}>
      {children}
    </MatchContext.Provider>
  );
};

export const useMatchContext = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatchContext must be used within a MatchProvider');
  }
  return context;
};
