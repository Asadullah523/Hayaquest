import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncService } from '../services/syncService';

export type AchievementCategory = 'Consistency' | 'Productivity' | 'Subject Mastery' | 'Exam Readiness';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: AchievementCategory;
  condition: (state: AchievementsState) => boolean;
  getProgress: (state: AchievementsState) => { current: number; total: number };
  howToEarn: string;
  motivationalQuote?: string;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: number; // timestamp
}

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Consistency
  { 
    id: 'streak_3', 
    name: 'Getting Started', 
    description: 'Maintain a 3-day study streak', 
    icon: '/assets/rewards/bronze_trophy.png', 
    tier: 'bronze',
    category: 'Consistency',
    condition: (s) => s.currentStreak >= 3,
    getProgress: (s) => ({ current: Math.min(s.currentStreak, 3), total: 3 }),
    howToEarn: 'Study for 3 consecutive days to build your momentum.',
    motivationalQuote: "Every expert was once a beginner. You're on your way!"
  },
  { 
    id: 'streak_7', 
    name: 'Week Warrior', 
    description: 'Maintain a 7-day study streak', 
    icon: '/assets/rewards/silver_trophy.png', 
    tier: 'silver',
    category: 'Consistency',
    condition: (s) => s.currentStreak >= 7,
    getProgress: (s) => ({ current: Math.min(s.currentStreak, 7), total: 7 }),
    howToEarn: 'Maintain focus for a full week without missing a day.',
    motivationalQuote: "A week of dedication shows true commitment!"
  },
  { 
    id: 'early_bird', 
    name: 'Early Bird', 
    description: 'Study before 9 AM 5 times', 
    icon: '/assets/rewards/clock_3d.png', 
    tier: 'bronze',
    category: 'Consistency',
    condition: (s) => s.earlyMorningSessions >= 5,
    getProgress: (s) => ({ current: Math.min(s.earlyMorningSessions, 5), total: 5 }),
    howToEarn: 'Start your study sessions early in the morning (before 9 AM).',
    motivationalQuote: "The early bird catches the knowledge!"
  },
  { 
    id: 'night_owl', 
    name: 'Night Owl', 
    description: 'Study after 10 PM 5 times', 
    icon: '/assets/rewards/clock_3d.png', 
    tier: 'bronze',
    category: 'Consistency',
    condition: (s) => s.lateNightSessions >= 5,
    getProgress: (s) => ({ current: Math.min(s.lateNightSessions, 5), total: 5 }),
    howToEarn: 'Study during the quiet hours of the night (after 10 PM).',
    motivationalQuote: "Great things happen when the world is asleep."
  },
  { 
    id: 'streak_30', 
    name: 'Month Master', 
    description: 'Maintain a 30-day study streak', 
    icon: '/assets/rewards/gold_trophy.png', 
    tier: 'gold',
    category: 'Consistency',
    condition: (s) => s.currentStreak >= 30,
    getProgress: (s) => ({ current: Math.min(s.currentStreak, 30), total: 30 }),
    howToEarn: 'Show ultimate discipline by studying for 30 days straight.',
    motivationalQuote: "30 days of discipline! You're unstoppable!"
  },
  
  // Productivity
  { 
    id: 'pomodoro_pro', 
    name: 'Pomodoro Pro', 
    description: 'Complete 10 focus sessions', 
    icon: '⚡', 
    tier: 'bronze',
    category: 'Productivity',
    condition: (s) => s.totalFocusSessions >= 10,
    getProgress: (s) => ({ current: Math.min(s.totalFocusSessions, 10), total: 10 }),
    howToEarn: 'Use the Pomodoro timer to complete 10 full focus sessions.',
    motivationalQuote: "Focus is a muscle. You're making it stronger!"
  },
  { 
    id: 'hours_10', 
    name: 'Dedicated Learner', 
    description: 'Study for 10 total hours', 
    icon: '/assets/rewards/silver_trophy.png', 
    tier: 'bronze',
    category: 'Productivity',
    condition: (s) => s.totalStudyHours >= 10,
    getProgress: (s) => ({ current: Math.min(s.totalStudyHours, 10), total: 10 }),
    howToEarn: 'Accumulate 10 hours of focused study time.',
    motivationalQuote: "Time invested in learning is never wasted!"
  },
  { 
    id: 'hours_50', 
    name: 'Time Warrior', 
    description: 'Study for 50 total hours', 
    icon: '/assets/rewards/gold_trophy.png', 
    tier: 'silver',
    category: 'Productivity',
    condition: (s) => s.totalStudyHours >= 50,
    getProgress: (s) => ({ current: Math.min(s.totalStudyHours, 50), total: 50 }),
    howToEarn: 'Push through to reach 50 total hours of mastery.',
    motivationalQuote: "50 hours of focus! That's the work ethic of champions!"
  },
  { 
    id: 'deep_work', 
    name: 'Deep Work Master', 
    description: 'Complete a 90-minute focus session', 
    icon: '🧠', 
    tier: 'silver',
    category: 'Productivity',
    condition: (s) => s.longestSessionMinutes >= 90,
    getProgress: (s) => ({ current: Math.min(s.longestSessionMinutes, 90), total: 90 }),
    howToEarn: 'Start a focus session and keep going for at least 90 minutes.',
    motivationalQuote: "Concentration is the secret of strength."
  },
  { 
    id: 'focus_guru', 
    name: 'Focus Guru', 
    description: 'Complete a 2-hour focus session', 
    icon: '🧘‍♂️', 
    tier: 'gold',
    category: 'Productivity',
    condition: (s) => s.longestSessionMinutes >= 120,
    getProgress: (s) => ({ current: Math.min(s.longestSessionMinutes, 120), total: 120 }),
    howToEarn: 'Reach ultimate focus by completing a 120-minute session.',
    motivationalQuote: "The man who can focus for 2 hours can change the world."
  },

  // Subject Mastery
  { 
    id: 'topics_10', 
    name: 'Topic Explorer', 
    description: 'Complete 10 topics', 
    icon: '/assets/rewards/book_3d.png', 
    tier: 'bronze',
    category: 'Subject Mastery',
    condition: (s) => s.totalTopicsCompleted >= 10,
    getProgress: (s) => ({ current: Math.min(s.totalTopicsCompleted, 10), total: 10 }),
    howToEarn: 'Check off 10 topics from your syllabus.',
    motivationalQuote: "Knowledge grows one topic at a time!"
  },
  { 
    id: 'topic_crusher', 
    name: 'Topic Crusher', 
    description: 'Complete 50 topics', 
    icon: '/assets/rewards/book_3d.png', 
    tier: 'silver',
    category: 'Subject Mastery',
    condition: (s) => s.totalTopicsCompleted >= 50,
    getProgress: (s) => ({ current: Math.min(s.totalTopicsCompleted, 50), total: 50 }),
    howToEarn: 'Break through the 50 topic milestone.',
    motivationalQuote: "You're crushing the syllabus! Keep it up!"
  },
  { 
    id: 'subject_complete', 
    name: 'Subject Master', 
    description: 'Complete all topics in one subject', 
    icon: '✅', 
    tier: 'silver',
    category: 'Subject Mastery',
    condition: (s) => s.subjectsFullyCompleted >= 1,
    getProgress: (s) => ({ current: Math.min(s.subjectsFullyCompleted, 1), total: 1 }),
    howToEarn: 'Master every single topic within a single subject.',
    motivationalQuote: "Mastering a subject completely shows true dedication!"
  },
  { 
    id: 'architect', 
    name: 'Architect', 
    description: 'Create 5 custom subjects', 
    icon: '📐', 
    tier: 'bronze',
    category: 'Subject Mastery',
    condition: (s) => s.totalSubjects >= 5,
    getProgress: (s) => ({ current: Math.min(s.totalSubjects, 5), total: 5 }),
    howToEarn: 'Organize your studies by creating 5 different subjects.',
    motivationalQuote: "A well-structured plan is half the battle won."
  },
  { 
    id: 'all_subjects', 
    name: 'Complete Scholar', 
    description: 'Complete all your subjects', 
    icon: '/assets/rewards/platinum_trophy.png', 
    tier: 'platinum',
    category: 'Subject Mastery',
    condition: (s) => s.totalSubjects > 0 && s.subjectsFullyCompleted >= s.totalSubjects,
    getProgress: (s) => ({ current: s.subjectsFullyCompleted, total: s.totalSubjects || 1 }),
    howToEarn: 'Complete 100% of all subjects in your dashboard.',
    motivationalQuote: "All subjects mastered! You're ready for anything!"
  },

  // Exam Readiness
  { 
    id: 'high_priority', 
    name: 'Critical Focus', 
    description: 'Complete 5 High Priority topics', 
    icon: '🎯', 
    tier: 'silver',
    category: 'Exam Readiness',
    condition: (s) => s.highPriorityCompleted >= 5,
    getProgress: (s) => ({ current: Math.min(s.highPriorityCompleted, 5), total: 5 }),
    howToEarn: 'Identify and complete 5 topics marked as High Priority.',
    motivationalQuote: "Focusing on what matters most is the key to efficiency."
  },
  { 
    id: 'priority_master', 
    name: 'Priority Master', 
    description: 'Complete 15 High Priority topics', 
    icon: '🚩', 
    tier: 'gold',
    category: 'Exam Readiness',
    condition: (s) => s.highPriorityCompleted >= 15,
    getProgress: (s) => ({ current: Math.min(s.highPriorityCompleted, 15), total: 15 }),
    howToEarn: 'Master 15 critical high-priority topics for your exam.',
    motivationalQuote: "You've conquered the hardest parts. The rest is easy!"
  },
  { 
    id: 'exam_ready', 
    name: 'Exam Ready', 
    description: 'Reach 80% mastery in 3 subjects', 
    icon: '🎓', 
    tier: 'gold',
    category: 'Exam Readiness',
    condition: (s) => s.subjectsWithHighMastery >= 3,
    getProgress: (s) => ({ current: Math.min(s.subjectsWithHighMastery, 3), total: 3 }),
    howToEarn: 'Maintain an 80% or higher completion rate across 3 different subjects.',
    motivationalQuote: "Success is where preparation and opportunity meet."
  },
];

interface AchievementsState {
  unlockedAchievements: UnlockedAchievement[];
  
  // Stats for achievement conditions
  currentStreak: number;
  totalTopicsCompleted: number;
  subjectsFullyCompleted: number;
  totalStudyHours: number;
  totalSubjectsCreated: number;
  totalSubjects: number;
  longestSessionMinutes: number;
  highPriorityCompleted: number;
  subjectsWithHighMastery: number;
  
  // New metrics
  totalFocusSessions: number;
  earlyMorningSessions: number;
  lateNightSessions: number;
  
  // Actions
  updateStats: (stats: Partial<Pick<AchievementsState, 
    'currentStreak' | 
    'totalTopicsCompleted' | 
    'subjectsFullyCompleted' | 
    'totalStudyHours' | 
    'totalSubjectsCreated' |
    'totalSubjects' |
    'longestSessionMinutes' |
    'highPriorityCompleted' |
    'subjectsWithHighMastery' |
    'totalFocusSessions' |
    'earlyMorningSessions' |
    'lateNightSessions'
  >>) => void;
  checkAchievements: () => void;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getTrophyTier: () => 'bronze' | 'silver' | 'gold' | 'platinum';
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      unlockedAchievements: [],
      currentStreak: 0,
      totalTopicsCompleted: 0,
      subjectsFullyCompleted: 0,
      totalStudyHours: 0,
      totalSubjectsCreated: 0,
      totalSubjects: 0,
      longestSessionMinutes: 0,
      highPriorityCompleted: 0,
      subjectsWithHighMastery: 0,
      totalFocusSessions: 0,
      earlyMorningSessions: 0,
      lateNightSessions: 0,

      updateStats: (stats) => {
        set((state) => ({ ...state, ...stats }));
        get().checkAchievements();
        syncService.triggerAutoBackup();
      },

      checkAchievements: () => {
        const state = get();
        const newUnlocks: UnlockedAchievement[] = [];
        
        ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
          const alreadyUnlocked = state.unlockedAchievements.some(
            u => u.achievementId === achievement.id
          );
          
          if (!alreadyUnlocked && achievement.condition(state)) {
            newUnlocks.push({
              achievementId: achievement.id,
              unlockedAt: Date.now()
            });
          }
        });

        if (newUnlocks.length > 0) {
          set(s => ({ 
            unlockedAchievements: [...s.unlockedAchievements, ...newUnlocks] 
          }));
          console.log('🏆 New Achievements Unlocked:', newUnlocks);
          syncService.triggerAutoBackup();
        }
      },

      getUnlockedAchievements: () => {
        const state = get();
        return ACHIEVEMENT_DEFINITIONS.filter(achievement =>
          state.unlockedAchievements.some(u => u.achievementId === achievement.id)
        ).sort((a, b) => {
          const tierOrder = { bronze: 0, silver: 1, gold: 2, platinum: 3 };
          return tierOrder[b.tier] - tierOrder[a.tier];
        });
      },

      getLockedAchievements: () => {
        const state = get();
        return ACHIEVEMENT_DEFINITIONS.filter(achievement =>
          !state.unlockedAchievements.some(u => u.achievementId === achievement.id)
        ).sort((a, b) => {
          const tierOrder = { bronze: 0, silver: 1, gold: 2, platinum: 3 };
          return tierOrder[a.tier] - tierOrder[b.tier];
        });
      },

      getTrophyTier: () => {
        const unlocked = get().unlockedAchievements.length;
        const total = ACHIEVEMENT_DEFINITIONS.length;
        const percentage = (unlocked / total) * 100;
        
        if (percentage >= 76) return 'platinum';
        if (percentage >= 51) return 'gold';
        if (percentage >= 26) return 'silver';
        return 'bronze';
      }
    }),
    {
      name: 'antigravity-achievements',
    }
  )
);
