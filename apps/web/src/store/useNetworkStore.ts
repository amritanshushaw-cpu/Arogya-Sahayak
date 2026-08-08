import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  setOnline: (isOnline: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  setOnline: (isOnline) => set({ isOnline }),
}));
