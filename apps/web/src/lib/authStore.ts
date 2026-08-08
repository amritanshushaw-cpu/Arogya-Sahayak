import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: any | null;
  role: string | null;
  language: string;
  setAuth: (token: string, user: any) => void;
  setLanguage: (lang: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      language: 'en-US',
      setAuth: (token, user) => set({ token, user, role: user?.role || null }),
      setLanguage: (lang) => set({ language: lang }),
      logout: () => set({ token: null, user: null, role: null }),
    }),
    {
      name: 'arogya-auth',
    }
  )
);
