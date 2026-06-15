import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { syncTabs } from 'zustand-sync-tabs'

interface UserState {
    user: {
        name: string;
        email: string;
        image?: string;
    }
    currentStreak: number;
    maxStreak: number;
    lastLoginDate?: string; // stored as 'YYYY-MM-DD'
    setUser: (user: Partial<Omit<UserState, 'setUser' | 'clearUser'>>) => void;
    clearUser: () => void;
}

export const userStore = create<UserState>()(
    persist(
        syncTabs(
            (set) => ({
                user: {
                    name: '',
                    email: '',
                    image: '',
                },
                currentStreak: 0,
                maxStreak: 0,
                lastLoginDate: '',

                setUser: (user) => set((state) => ({ ...state, ...user })),
                clearUser: () => set({
                    user: {
                        name: '',
                        email: '',
                        image: '',
                    },
                    currentStreak: 0,
                    maxStreak: 0,
                    lastLoginDate: ''
                })
            }),
            { name: 'user-sync' }
        ),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)