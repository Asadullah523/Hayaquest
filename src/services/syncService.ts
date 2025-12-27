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
  _isPaused: false,
  _lastLocalUpdate: 0,

  pauseSync() {
    this._isPaused = true;
    console.log('Sync service: PAUSED');
  },

  resumeSync() {
    this._isPaused = false;
    console.log('Sync service: RESUMED');
  },

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
    if (this._isSyncing || this._isPaused) return;
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
    if (this._isSyncing || this._isPaused) return;
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
            
            const localItems = await table.toArray();
            const localMap = new Map(localItems.map((i: any) => [i.id, i]));
            
            const toUpdate: any[] = [];
            
            for (const remoteItem of remoteItems) {
                const localItem = localMap.get(remoteItem.id) as any;
                
                if (!localItem) {
                    // New item from remote
                    toUpdate.push(remoteItem);
                } else {
                    // Conflict Resolution Logic (LWW + Progress Union)
                    const remoteUpdated = (remoteItem as any).updatedAt || 0;
                    const localUpdated = (localItem as any).updatedAt || 0;
                    
                    // 1. Progress Union: If either is completed, keep it completed
                    // This protects against "reverting" a checkbox due to stale sync
                    const mergedIsCompleted = localItem.isCompleted || remoteItem.isCompleted;
                    
                    if (remoteUpdated > localUpdated) {
                        // Remote is newer, but we still apply Progress Union for safety
                        toUpdate.push({
                            ...remoteItem,
                            isCompleted: mergedIsCompleted // Higher progress wins
                        });
                    } else if (mergedIsCompleted && !localItem.isCompleted) {
                        // Even if local is newer (or same), if remote has progress we don't have, take it
                        toUpdate.push({
                            ...localItem,
                            isCompleted: true,
                            updatedAt: Date.now() // Record this merge
                        });
                    }
                }
            }

            if (toUpdate.length > 0) {
                await table.bulkPut(toUpdate);
            }
            
            // 2. Find and delete local items that are no longer in remote
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
        // XP/Level: take higher value
        const currentGamification = useGamificationStore.getState();
        useGamificationStore.setState({
          xp: Math.max(currentGamification.xp, remoteData.gamification.xp),
          level: Math.max(currentGamification.level, remoteData.gamification.level),
          unlockedBadges: Array.from(new Set([...currentGamification.unlockedBadges, ...(remoteData.gamification.unlockedBadges || [])])),
        });
      }

      if (remoteData.achievements) {
        const currentAchievements = useAchievementsStore.getState().unlockedAchievements;
        useAchievementsStore.setState({ 
          unlockedAchievements: Array.from(new Set([...currentAchievements, ...(remoteData.achievements || [])]))
        });
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

      // Restore quiz data to localStorage (Union Merge)
      if (remoteData.quiz) {
          Object.entries(remoteData.quiz).forEach(([key, value]) => {
              if (typeof value === 'string') {
                  // For completion keys, only set if it's 'true' and we don't have it or have 'false'
                  if (key.startsWith('quiz_completed_')) {
                      if (value === 'true' && localStorage.getItem(key) !== 'true') {
                          localStorage.setItem(key, value);
                      }
                  } else {
                      // For progress/other keys, take newest (but quiz progress is ephemeral anyway)
                      localStorage.setItem(key, value);
                  }
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
      if (isAuthenticated && !this._isSyncing && !this._isPaused) {
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
      if (isAuthenticated && !this._isPaused) {
        console.log('Triggered auto-backup...');
        this.backup().catch(console.error);
      }
    }, 2000); // 2 second debounce
  }
};
