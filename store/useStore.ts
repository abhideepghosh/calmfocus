import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppState {
    hasCompletedOnboarding: boolean;
    setHasCompletedOnboarding: (val: boolean) => void;
    blockedApps: string[];
    toggleBlockedApp: (packageName: string) => void;
    isFocusModeActive: boolean;
    setFocusModeActive: (val: boolean) => void;
    timerDuration: number;
    setTimerDuration: (val: number) => void;
    timerEndTime: number | null;
    setTimerEndTime: (val: number | null) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            hasCompletedOnboarding: false,
            setHasCompletedOnboarding: (val) => set({ hasCompletedOnboarding: val }),
            blockedApps: [],
            toggleBlockedApp: (packageName) => set((state) => {
                const exists = state.blockedApps.includes(packageName);
                return {
                    blockedApps: exists
                        ? state.blockedApps.filter(p => p !== packageName)
                        : [...state.blockedApps, packageName]
                };
            }),
            isFocusModeActive: false,
            setFocusModeActive: (val) => set({ isFocusModeActive: val }),
            timerDuration: 25 * 60, // 25 minutes default
            setTimerDuration: (val) => set({ timerDuration: val }),
            timerEndTime: null,
            setTimerEndTime: (val) => set({ timerEndTime: val })
        }),
        {
            name: 'calm-focus-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
