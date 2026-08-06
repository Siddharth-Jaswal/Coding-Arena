import { create } from 'zustand';
import { MATCHMAKING_STATES } from '../constants/matchmaking.constants';

export const useMatchmakingStore = create((set, get) => ({
  status: MATCHMAKING_STATES.IDLE,
  elapsedTime: 0,
  estimatedTime: 120, // seconds (mocked)
  timerInterval: null,

  // Callbacks passed by components to trigger state changes
  onFindMatch: () => {
    const { status } = get();
    if (status !== MATCHMAKING_STATES.IDLE && status !== MATCHMAKING_STATES.CANCELLED) return;
    
    // Transition to queued (mocking joining briefly)
    set({ status: MATCHMAKING_STATES.JOINING });
    
    setTimeout(() => {
      set({ status: MATCHMAKING_STATES.QUEUED, elapsedTime: 0 });
      get().startTimer();
    }, 500);
  },

  onCancel: () => {
    const { status } = get();
    if (status !== MATCHMAKING_STATES.QUEUED) return;

    get().stopTimer();
    set({ status: MATCHMAKING_STATES.CANCELLED });
    
    // Reset back to idle after a brief moment
    setTimeout(() => {
      set({ status: MATCHMAKING_STATES.IDLE, elapsedTime: 0 });
    }, 1500);
  },

  startTimer: () => {
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
  
  // Future actions for backend socket integration
  setMatchFound: () => {
    get().stopTimer();
    set({ status: MATCHMAKING_STATES.MATCH_FOUND });
  },
  
  setError: (error) => {
    get().stopTimer();
    set({ status: MATCHMAKING_STATES.ERROR });
    console.error("Matchmaking Error:", error);
  }
}));
