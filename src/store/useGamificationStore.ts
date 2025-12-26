import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncService } from '../services/syncService';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string; // Emoji for MVP
    condition: (state: GamificationState) => boolean;
}

export const BADGE_DEFINITIONS: Badge[] = [
    { id: 'first_step', name: 'First Step', description: 'Log your first study session', icon: '🌱', condition: (s) => s.xp > 0 },
    { id: 'rising_star', name: 'Rising Star', description: 'Reach Level 5', icon: '⭐', condition: (s) => s.level >= 5 },
    { id: 'devoted', name: 'Deep Focus', description: 'Earn 1000 XP', icon: '🔥', condition: (s) => s.xp >= 1000 },
    { id: 'scholar', name: 'Scholar', description: 'Reach Level 10', icon: '🎓', condition: (s) => s.level >= 10 },
    { id: 'goal_met', name: 'Goal Crusher', description: 'Hit your daily study goal for the first time', icon: '🎯', condition: () => true }, // Manual trigger
    { id: 'streak_7', name: 'Unstoppable', description: 'Maintain a 7-day study streak', icon: '⚡', condition: () => true }, // Manual trigger
    { id: 'elite', name: 'Elite Learner', description: 'Reach Level 20', icon: '👑', condition: (s) => s.level >= 20 },
];

interface GamificationState {
  xp: number;
  level: number;
  unlockedBadges: string[]; // IDs of unlocked badges
  
  addXp: (amount: number) => void;
  checkBadges: () => void;
  unlockBadge: (id: string) => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      unlockedBadges: [],

      addXp: (amount) => {
        const { xp } = get();
        const newXp = xp + amount;
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
        
        set((state) => {
            if (newLevel > state.level) {
                console.log(`Level Up! ${state.level} -> ${newLevel}`);
            }
            return { xp: newXp, level: newLevel };
        });
        
        get().checkBadges();
        syncService.triggerAutoBackup();
      },

      checkBadges: () => {
          const state = get();
          const newBadges: string[] = [];
          
          BADGE_DEFINITIONS.forEach(badge => {
              if (badge.condition(state) && !state.unlockedBadges.includes(badge.id)) {
                  newBadges.push(badge.id);
              }
          });

          if (newBadges.length > 0) {
              set(s => ({ unlockedBadges: [...s.unlockedBadges, ...newBadges] }));
              console.log("Unlocked Badges:", newBadges);
              syncService.triggerAutoBackup();
          }
      },

      unlockBadge: (badgeId) => {
          set(state => {
              if (state.unlockedBadges.includes(badgeId)) return state;
              return { unlockedBadges: [...state.unlockedBadges, badgeId] };
          });
          syncService.triggerAutoBackup();
      }
    }),
    {
      name: 'antigravity-gamification',
    }
  )
);
