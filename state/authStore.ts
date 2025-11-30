import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UserProfile, UserRole } from '@/types/entities';

export interface AuthState {
  mobile?: string;
  otpRequestedAt?: string;
  isAuthenticated: boolean;
  role?: UserRole;
  profile?: UserProfile | null;
  onboardingComplete: boolean;
  actions: {
    requestOtp: (mobile: string) => void;
    verifyOtp: (mobile?: string) => void;
    completeOnboarding: (profile: UserProfile) => void;
    switchRole: (role: UserRole) => void;
    updateProfile: (profile: UserProfile | null) => void;
    logout: () => void;
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      onboardingComplete: false,
      actions: {
        requestOtp: (mobile: string) =>
          set({ mobile, otpRequestedAt: new Date().toISOString() }),
        verifyOtp: (mobile?: string) =>
          set({
            isAuthenticated: true,
            mobile: mobile ?? get().mobile,
          }),
        completeOnboarding: (profile: UserProfile) =>
          set({ profile, role: profile.role, onboardingComplete: true }),
        switchRole: (role: UserRole) => set({ role }),
        updateProfile: (profile: UserProfile | null) => set({ profile }),
        logout: () => set({ isAuthenticated: false, role: undefined, profile: undefined, onboardingComplete: false }),
      },
    }),
    {
      name: 'nidhisetu-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        mobile: state.mobile,
        role: state.role,
        profile: state.profile,
        onboardingComplete: state.onboardingComplete,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
