import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncService } from '../services/syncService';

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
      setName: (name) => { set({ name }); syncService.triggerAutoBackup(); },
      setAvatar: (avatar) => { set({ avatar }); syncService.triggerAutoBackup(); },
      setDailyGoalMinutes: (dailyGoalMinutes) => { set({ dailyGoalMinutes }); syncService.triggerAutoBackup(); },
    }),
    {
      name: 'user-storage',
    }
  )
);
