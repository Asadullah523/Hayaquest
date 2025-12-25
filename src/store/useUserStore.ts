import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  name: string;
  avatar: string;
  dailyGoalMinutes: number;
  setName: (name: string) => void;
  setAvatar: (avatar: string) => void;
  setDailyGoalMinutes: (minutes: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: 'Haya',
      avatar: 'owl',
      dailyGoalMinutes: 120,
      setName: (name) => set({ name }),
      setAvatar: (avatar) => set({ avatar }),
      setDailyGoalMinutes: (dailyGoalMinutes) => set({ dailyGoalMinutes }),
    }),
    {
      name: 'user-storage',
    }
  )
);
