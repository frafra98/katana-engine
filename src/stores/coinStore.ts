import { create } from "zustand";

type CoinState = {
  coinCount: number;
  increment: () => void;
};

export const useCoinStore = create<CoinState>((set) => ({
  coinCount: 0,
  increment: () => set((state) => ({ coinCount: state.coinCount + 1 })),
}));