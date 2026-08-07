import { create } from 'zustand';
import { MATCHMAKING_STATES } from '../constants/matchmaking.constants';

export const useMatchmakingStore = create((set, get) => ({
  status: MATCHMAKING_STATES.IDLE,
  elapsedTime: 0,
  estimatedTime: 120, // Mocked estimation 
  timerInterval: null,
  
  // Contest Metadata
  roomId: null,
  opponent: null,
  contestMetadata: null,
  error: null,

  // UI Only Actions (The actual socket emission is handled by the hook)
  setJoining: () => {
    set({ status: MATCHMAKING_STATES.JOINING, error: null });
  },

  setQueued: () => {
    set({ status: MATCHMAKING_STATES.QUEUED, elapsedTime: 0, error: null });
    get().startTimer();
  },

  setMatchFound: (payload) => {
    get().stopTimer();
    set({ 
      status: MATCHMAKING_STATES.MATCH_FOUND,
      roomId: payload.roomId,
      opponent: payload.opponent,
      error: null
    });
  },

  setRoomData: (payload) => {
    set({ contestMetadata: payload });
  },

  setCancelled: () => {
    get().stopTimer();
    set({ status: MATCHMAKING_STATES.CANCELLED });
    
    // Auto reset to idle
    setTimeout(() => {
      set({ status: MATCHMAKING_STATES.IDLE, elapsedTime: 0, roomId: null, opponent: null, contestMetadata: null });
    }, 1500);
  },

  setError: (errorMessage) => {
    get().stopTimer();
    set({ status: MATCHMAKING_STATES.ERROR, error: errorMessage });
  },

  // Internal Timer for UI elapsed time
  startTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);
    const interval = setInterval(() => {
      set((state) => ({ elapsedTime: state.elapsedTime + 1 }));
    }, 1000);
    set({ timerInterval: interval });
  },

  stopTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);
    set({ timerInterval: null });
  },
  
  reset: () => {
    get().stopTimer();
    set({ 
      status: MATCHMAKING_STATES.IDLE, 
      elapsedTime: 0, 
      roomId: null, 
      opponent: null, 
      contestMetadata: null,
      error: null
    });
  }
}));
