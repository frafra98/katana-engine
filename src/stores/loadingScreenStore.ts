import { create } from "zustand";

type LoadingState = {
  progress: number;
  isLoading: boolean;
  setProgress: (p: number) => void;
  start: () => void;
  finish: () => void;
};

export const useLoadingStore = create<LoadingState>((set) => ({
  progress: 0,
  isLoading: false,

  setProgress: (p) => set({ progress: p }),

  start: () => set({ isLoading: true, progress: 0 }),

  finish: () => set({ isLoading: false, progress: 100 }),
}));