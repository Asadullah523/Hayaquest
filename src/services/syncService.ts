import { db } from '../db/db';
import api from './api';
import { useSubjectStore } from '../store/useSubjectStore';
import { useLogStore } from '../store/useLogStore';
import { useTimetableStore } from '../store/useTimetableStore';
import { useGamificationStore } from '../store/useGamificationStore';
import { useAchievementsStore } from '../store/useAchievementsStore';
import { useWritingCheckerStore } from '../store/useWritingCheckerStore';
import { useEnglishStore } from '../store/useEnglishStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { useTimerStore } from '../store/useTimerStore';

export const syncService = {
  async getAllLocalData() {
    // Get data from Dexie
    const subjects = await db.subjects.toArray();
    const topics = await db.topics.toArray();
    const logs = await db.logs.toArray();
    const timetable = await db.timetable.toArray();
    const settings = await db.settings.toArray();
    const resources = await db.resources.toArray();

    // Get data from Zustand stores
    const gamification = useGamificationStore.getState();
    const achievements = useAchievementsStore.getState();
    const writingChecker = useWritingCheckerStore.getState();
    const english = useEnglishStore.getState();
    const user = useUserStore.getState();
    const timer = useTimerStore.getState();

    return {
      subjects,
      topics,
      logs,
      timetable,
      settings,
      resources,
      gamification: {
        xp: gamification.xp,
        level: gamification.level,
        unlockedBadges: gamification.unlockedBadges,
      },
      achievements: achievements.unlockedAchievements,
      writingChecker: {
        drafts: writingChecker.drafts,
        preferences: writingChecker.preferences,
      },
      englishProgress: {
        wordsLearned: english.wordsLearned,
        wordConfidence: english.wordConfidence,
        favoriteWords: english.favoriteWords,
        storiesRead: english.storiesRead,
        favoriteStories: english.favoriteStories,
        grammarTopicsMastered: english.grammarTopicsMastered,
        dailyStreak: english.dailyStreak,
        lastStudyDate: english.lastStudyDate,
        wordsRead: english.wordsRead,
      },
      user: {
        name: user.name,
        avatar: user.avatar,
        dailyGoalMinutes: user.dailyGoalMinutes
      },
      timer: {
        todayStats: timer.todayStats,
        sessionHistory: timer.sessionHistory,
        config: timer.config
      }
    };
  },

  async backup() {
    try {
      const data = await this.getAllLocalData();
      await api.post('/sync/backup', { data });
      console.log('Backup successful');
    } catch (err) {
      console.error('Backup failed', err);
      throw err;
    }
  },

  async restore() {
    try {
      const { data: remoteData } = await api.get('/sync/restore');
      if (!remoteData) return;

      // Restore to Dexie
      await db.transaction('rw', [db.subjects, db.topics, db.logs, db.timetable, db.settings, db.resources], async () => {
        await db.subjects.clear();
        await db.topics.clear();
        await db.logs.clear();
        await db.timetable.clear();
        await db.settings.clear();
        await db.resources.clear();

        if (remoteData.subjects) await db.subjects.bulkAdd(remoteData.subjects);
        if (remoteData.topics) await db.topics.bulkAdd(remoteData.topics);
        if (remoteData.logs) await db.logs.bulkAdd(remoteData.logs);
        if (remoteData.timetable) await db.timetable.bulkAdd(remoteData.timetable);
        if (remoteData.settings) await db.settings.bulkAdd(remoteData.settings);
        if (remoteData.resources) await db.resources.bulkAdd(remoteData.resources);
      });

      // Restore to Zustand stores
      if (remoteData.gamification) {
        useGamificationStore.setState({
          xp: remoteData.gamification.xp,
          level: remoteData.gamification.level,
          unlockedBadges: remoteData.gamification.unlockedBadges,
        });
      }

      if (remoteData.achievements) {
        useAchievementsStore.setState({
          unlockedAchievements: remoteData.achievements,
        });
      }

      if (remoteData.writingChecker) {
        useWritingCheckerStore.setState({
          drafts: remoteData.writingChecker.drafts,
          preferences: remoteData.writingChecker.preferences,
        });
      }

      if (remoteData.englishProgress) {
        useEnglishStore.setState({
          ...remoteData.englishProgress
        });
      }
      
      if (remoteData.user) {
        useUserStore.setState({
          name: remoteData.user.name,
          avatar: remoteData.user.avatar,
          dailyGoalMinutes: remoteData.user.dailyGoalMinutes
        });
        
        // Also update auth user if exists for consistency
        const auth = useAuthStore.getState();
        if (auth.isAuthenticated) {
          auth.updateUser({
            name: remoteData.user.name,
            avatar: remoteData.user.avatar
          });
        }
      }

      if (remoteData.timer) {
        useTimerStore.setState({
          todayStats: remoteData.timer.todayStats,
          sessionHistory: remoteData.timer.sessionHistory,
          config: remoteData.timer.config,
          // Reset local active session to avoid stale state
          activeSession: null,
          isActive: false,
          timeLeft: remoteData.timer.config?.focusDuration || 25 * 60
        });
      }

      // Reload stores that pull from Dexie
      await useSubjectStore.getState().loadSubjects();
      await useSubjectStore.getState().loadAllTopics();
      await useLogStore.getState().loadAllLogs();
      await useTimetableStore.getState().loadTimetable();

      console.log('Restore successful');
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.log('No backup found in cloud, skipping restore');
        return;
      }
      console.error('Restore failed', err);
      throw err;
    }
  },

  async clearCloudData() {
    try {
      await api.delete('/sync/reset');
      console.log('Cloud data cleared');
    } catch (err) {
      console.error('Failed to clear cloud data', err);
      throw err;
    }
  },

  initAutoSync(intervalMinutes = 2) {
    const interval = intervalMinutes * 60 * 1000;
    
    // Background interval for both backup and restore
    setInterval(async () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        console.log('Auto-sync: performing background sync...');
        try {
          // Backup local changes first
          await this.backup();
          // Then restore any remote changes
          await this.restore();
        } catch (err) {
          console.error('Auto-sync failed', err);
        }
      }
    }, interval);
  },

  // Helper for immediate debounced backup after updates
  _backupTimeout: null as any,
  triggerAutoBackup() {
    if (this._backupTimeout) clearTimeout(this._backupTimeout);
    this._backupTimeout = setTimeout(() => {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        console.log('Triggered auto-backup...');
        this.backup().catch(console.error);
      }
    }, 5000); // 5 second debounce
  }
};
