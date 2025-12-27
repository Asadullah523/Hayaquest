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
  // Sync state management
  _isSyncing: false,
  _lastLocalUpdate: 0,

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

    // Get quiz data from localStorage
    const quizData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('quiz_completed_') || key.startsWith('quiz_progress_'))) {
            quizData[key] = localStorage.getItem(key) || '';
        }
    }

    return {
      subjects,
      topics,
      logs,
      timetable,
      settings,
      resources,
      quiz: quizData,
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
    if (this._isSyncing) return;
    try {
      this._isSyncing = true;
      const data = await this.getAllLocalData();
      await api.post('/sync/backup', { data });
      console.log('Backup successful');
    } catch (err) {
      console.error('Backup failed', err);
      throw err;
    } finally {
      this._isSyncing = false;
    }
  },

  async restore() {
    if (this._isSyncing) return;
    // Don't restore if we just had a local update (within 5 seconds) 
    // to avoid pulling stale data before backup completes
    if (Date.now() - this._lastLocalUpdate < 5000) {
      console.log('Skipping restore: local update recently triggered');
      return;
    }

    try {
      this._isSyncing = true;
      const { data: remoteData } = await api.get('/sync/restore');
      if (!remoteData) return;

      // Smart decision: Check if remote data is different from local data
      // before performing expensive (and flapping) store updates
      const localData = await this.getAllLocalData();
      
      // We focus on critical fields for comparison to avoid performance issues
      const isDifferent = JSON.stringify({
        s: remoteData.subjects,
        t: remoteData.topics,
        g: remoteData.gamification,
        l: remoteData.logs,
        q: remoteData.quiz
      }) !== JSON.stringify({
        s: localData.subjects,
        t: localData.topics,
        g: localData.gamification,
        l: localData.logs,
        q: localData.quiz
      });

      if (!isDifferent) {
        console.log('Restore skipped: remote data is identical to local');
        return;
      }

      // Restore to Dexie
      await db.transaction('rw', [db.subjects, db.topics, db.logs, db.timetable, db.settings, db.resources], async () => {
        const syncTable = async (table: any, remoteItems: any[]) => {
            if (!remoteItems) return;
            await table.bulkPut(remoteItems);
            const remoteIds = new Set(remoteItems.map((i: any) => i.id).filter((id: any) => id !== undefined));
            const localKeys = await table.toCollection().primaryKeys();
            const toDelete = localKeys.filter((k: any) => !remoteIds.has(k));
            if (toDelete.length > 0) {
                await table.bulkDelete(toDelete);
            }
        };

        await syncTable(db.subjects, remoteData.subjects || []);
        await syncTable(db.topics, remoteData.topics || []);
        await syncTable(db.logs, remoteData.logs || []);
        await syncTable(db.timetable, remoteData.timetable || []);
        await syncTable(db.settings, remoteData.settings || []);
        await syncTable(db.resources, remoteData.resources || []);
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
        useAchievementsStore.setState({ unlockedAchievements: remoteData.achievements });
      }

      if (remoteData.writingChecker) {
        useWritingCheckerStore.setState({
          drafts: remoteData.writingChecker.drafts,
          preferences: remoteData.writingChecker.preferences,
        });
      }

      if (remoteData.englishProgress) {
        useEnglishStore.setState({ ...remoteData.englishProgress });
      }
      
      if (remoteData.user) {
        useUserStore.setState({
          name: remoteData.user.name,
          avatar: remoteData.user.avatar,
          dailyGoalMinutes: remoteData.user.dailyGoalMinutes
        });
        
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
          activeSession: null,
          isActive: false,
          timeLeft: remoteData.timer.config?.focusDuration || 25 * 60
        });
      }

      // Restore quiz data to localStorage
      if (remoteData.quiz) {
          Object.entries(remoteData.quiz).forEach(([key, value]) => {
              if (typeof value === 'string') {
                  localStorage.setItem(key, value);
              }
          });
          // Dispatch storage event so components can update immediately
          window.dispatchEvent(new Event('storage'));
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
    } finally {
      this._isSyncing = false;
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

  initAutoSync(intervalSeconds = 15) {
    const interval = intervalSeconds * 1000;
    
    // Background interval for both backup and restore
    setInterval(async () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated && !this._isSyncing) {
        console.log('Auto-sync: performing background sync...');
        try {
          // Backup local changes first
          await this.backup();
          // Then restore any remote changes (smart check inside)
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
    this._lastLocalUpdate = Date.now();
    if (this._backupTimeout) clearTimeout(this._backupTimeout);
    this._backupTimeout = setTimeout(() => {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        console.log('Triggered auto-backup...');
        this.backup().catch(console.error);
      }
    }, 2000); // 2 second debounce
  }
};
