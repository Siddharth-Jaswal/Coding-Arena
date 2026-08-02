import { create } from 'zustand';

// Placeholder store for future Matchmaking / Real-time Battles
export const useMatchStore = create((set) => ({
  currentMatch: null,
  isSearching: false,
  opponent: null,
  setMatchState: (state) => set({ ...state }),
  leaveMatch: () => set({ currentMatch: null, opponent: null, isSearching: false }),
}));
