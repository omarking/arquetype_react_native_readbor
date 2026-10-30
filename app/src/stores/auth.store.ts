import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/schemas/auth.schema';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false,
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        }),
      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      setHydrated: (state) =>
        set({
          isHydrated: state,
          isLoading: !state,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
