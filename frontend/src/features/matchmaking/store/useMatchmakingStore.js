import { create } from 'zustand';
import { MATCHMAKING_STATES } from '../constants/matchmaking.constants';

export const useMatchmakingStore = create((set, get) => ({
  status: MATCHMAKING_STATES.IDLE,
  elapsedTime: 0,
  estimatedTime: 120, // Mocked estimation 
  timerInterval: null,
  
  // Contest Metadata
  mode: 'ranked',
  roomId: null,
  opponent: null,
  contestMetadata: null,
  attemptId: null,
  error: null,
  cancelTimer: null,

  setMode: (mode) => set({ mode }),

  // UI Only Actions (The actual socket emission is handled by the hook)
  setJoining: (attemptId, mode = 'ranked') => {
    const { cancelTimer } = get();
    if (cancelTimer) clearTimeout(cancelTimer);
    set({ status: MATCHMAKING_STATES.JOINING, attemptId, mode, error: null, cancelTimer: null });
  },

  setQueued: () => {
    set({ status: MATCHMAKING_STATES.QUEUED, elapsedTime: 0, error: null });
    get().startTimer();
  },

  setMatchFound: (payload) => {
    get().stopTimer();
    const { cancelTimer } = get();
    if (cancelTimer) clearTimeout(cancelTimer);
    set({ 
      status: MATCHMAKING_STATES.MATCH_FOUND,
      roomId: payload.roomId,
      opponent: payload.opponent,
      error: null,
      cancelTimer: null
    });
  },

  setRoomData: (payload) => {
    set({ contestMetadata: payload });
  },

  setCancelled: () => {
    get().stopTimer();
    const { cancelTimer } = get();
    if (cancelTimer) clearTimeout(cancelTimer);

    set({ status: MATCHMAKING_STATES.CANCELLED });
    
    // Auto reset to idle only if state is still CANCELLED
    const timeout = setTimeout(() => {
      if (get().status === MATCHMAKING_STATES.CANCELLED) {
        set({ 
          status: MATCHMAKING_STATES.IDLE, 
          elapsedTime: 0, 
          roomId: null, 
          opponent: null, 
          contestMetadata: null, 
          attemptId: null,
          cancelTimer: null 
        });
      }
    }, 1500);

    set({ cancelTimer: timeout });
  },

  setError: (errorMessage) => {
    get().stopTimer();
    const { cancelTimer } = get();
    if (cancelTimer) clearTimeout(cancelTimer);
    set({ status: MATCHMAKING_STATES.ERROR, error: errorMessage, cancelTimer: null });
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
    const { cancelTimer } = get();
    if (cancelTimer) clearTimeout(cancelTimer);
    set({ 
      status: MATCHMAKING_STATES.IDLE, 
      elapsedTime: 0, 
      roomId: null, 
      opponent: null, 
      contestMetadata: null, 
      attemptId: null,
      error: null,
      cancelTimer: null
    });
  }
}));
