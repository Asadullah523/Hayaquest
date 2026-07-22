import { create } from 'zustand';
import { db } from '../db/db';
import type { StudyLog } from '../types';
import { useGamificationStore } from './useGamificationStore';
import { syncService } from '../services/syncService';
import { useAuthStore } from './useAuthStore';

const getCurrentUserId = () => {
  const { user, isAuthenticated } = useAuthStore.getState();
  return isAuthenticated && user ? user.email : 'guest';
};

interface LogState {
  logs: StudyLog[];
  isLoading: boolean;
  error: string | null;

  addLog: (log: Omit<StudyLog, 'id'>) => Promise<void>;
  loadLogsByDate: (date: Date) => Promise<void>; 
  loadAllLogs: () => Promise<void>;
  loadRecentLogs: (limit?: number) => Promise<void>; 
  
  // Streak
  streak: number;
  calculateStreak: () => Promise<void>;
  
  // Recent
  recentLogs: StudyLog[];
}

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  recentLogs: [],
  isLoading: false,
  error: null,
  streak: 0,

  addLog: async (log) => {
    try {
      const userId = getCurrentUserId();
      const updatedAt = Date.now();
      await db.logs.add({ ...log, userId, updatedAt } as StudyLog);
      
      // Calculate XP: 10 XP per 15 minutes (900 seconds)
      const xpEarned = Math.max(10, Math.floor(log.durationSeconds / 900) * 10);
      useGamificationStore.getState().addXp(xpEarned);

      // Recalculate streak after adding
      await get().calculateStreak();
      
      syncService.triggerAutoBackup();
    } catch (error) {
      set({ error: 'Failed to add log' });
      throw error;
    }
  },

  loadLogsByDate: async (_date) => {
    set({ isLoading: true });
    try {
       const userId = getCurrentUserId();
       const logs = await db.logs.where('userId').equals(userId).toArray(); 
       set({ logs, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load logs', isLoading: false });
    }
  },

  loadAllLogs: async () => {
      set({ isLoading: true });
      try {
          const userId = getCurrentUserId();
          const logs = await db.logs.where('userId').equals(userId).sortBy('timestamp');
          set({ logs, isLoading: false });
      } catch (error) {
          set({ error: 'Failed to load all logs' });
      }
  },

  loadRecentLogs: async (limit = 10) => {
      set({ isLoading: true });
      try {
          const userId = getCurrentUserId();
          const logs = await db.logs.where('userId').equals(userId).reverse().sortBy('timestamp');
          set({ recentLogs: logs.slice(0, limit), isLoading: false });
      } catch (error) {
          set({ error: 'Failed to load recent logs' });
      }
  },

  calculateStreak: async () => {
    try {
        const { differenceInCalendarDays, startOfDay } = await import('date-fns');
        const userId = getCurrentUserId();
        
        const logs = await db.logs.where('userId').equals(userId).toArray();
        const completedTopics = await db.topics.where('userId').equals(userId).filter(t => t.isCompleted && !!t.completedAt).toArray();
        
        // Include today's focus time from timer store
        const { useTimerStore } = await import('./useTimerStore');
        const { totalFocusTime } = useTimerStore.getState().todayStats;
        
        const logDates = logs.map(l => l.date);
        const topicDates = completedTopics.map(t => t.completedAt as number);
        
        // If today has more than 60 seconds of focus time, count it as a study day
        if (totalFocusTime >= 60) {
            logDates.push(new Date().getTime());
        }
        
        const allDates = [...logDates, ...topicDates];

        if (allDates.length === 0) {
            set({ streak: 0 });
            return;
        }

        const today = startOfDay(new Date());
        
        // Get unique dates (normalized to start of day)
        const uniqueDays = Array.from(new Set(allDates.map(date => 
            startOfDay(new Date(date)).toISOString()
        )))
        .map(iso => new Date(iso))
        .sort((a, b) => b.getTime() - a.getTime());

        if (uniqueDays.length === 0) {
            set({ streak: 0 });
            return;
        }

        const latestDay = uniqueDays[0];
        const diffFromToday = differenceInCalendarDays(today, latestDay);
        
        // If last study was more than 1 day ago (missed yesterday), streak is 0
        if (diffFromToday > 1) {
            set({ streak: 0 });
            return;
        }

        let currentStreak = 1;

        for (let i = 0; i < uniqueDays.length - 1; i++) {
            const current = uniqueDays[i];
            const next = uniqueDays[i + 1];
            
            const diff = differenceInCalendarDays(current, next);
            
            if (diff === 1) {
                currentStreak++;
            } else if (diff > 1) {
                break;
            }
        }
        
        set({ streak: currentStreak });

    } catch (error) {
        console.error("Streak calc error", error);
    }
  }
}));