import { create } from 'zustand';

export const useSubmissionStore = create((set) => ({
  activeSubmission: null,
  setActiveSubmission: (submission) => set({ activeSubmission: submission }),
  clearSubmission: () => set({ activeSubmission: null }),
}));
