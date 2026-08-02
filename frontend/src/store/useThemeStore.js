import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: 'dark', // default to gaming dark mode
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));
