import { db } from '../db/db';
import { normalizeName } from '../utils/stringUtils';
import { useAuthStore } from '../store/useAuthStore';
import { useGamificationStore } from '../store/useGamificationStore';
import { useAchievementsStore } from '../store/useAchievementsStore';
import { useWritingCheckerStore } from '../store/useWritingCheckerStore';
import { useEnglishStore } from '../store/useEnglishStore';
import { useUserStore } from '../store/useUserStore';
import { useTimerStore } from '../store/useTimerStore';
import { useSubjectStore } from '../store/useSubjectStore';
import { useLogStore } from '../store/useLogStore';
import { useTimetableStore } from '../store/useTimetableStore';
import { useSyncStore } from '../store/useSyncStore';
import api from './api';

const getCurrentUserId = () => {
  const { user, isAuthenticated } = useAuthStore.getState();
  return isAuthenticated && user ? user.email : 'guest';
};

export const syncService = {
  // Sync state management
  _isSyncing: false,
  _isPaused: false,
  _isInitialized: false, // New: guard against backup before first load
  _lastLocalUpdate: 0,

  pauseSync() {
    this._isPaused = true;
    console.log('Sync service: PAUSED');
  },

  resumeSync() {
    this._isPaused = false;
    console.log('Sync service: RESUMED');
  },

  markInitialized() {
    this._isInitialized = true;
    console.log('Sync service: INITIALIZED (Backup permitted)');
  },

  async getAllLocalData() {
    const userId = getCurrentUserId();
    // Get data from Dexie filtered by userId
    const subjects = await db.subjects.where('userId').equals(userId).toArray();
    const topics = await db.topics.where('userId').equals(userId).toArray();
    const logs = await db.logs.where('userId').equals(userId).toArray();
    const timetable = await db.timetable.where('userId').equals(userId).toArray();
    const settings = await db.settings.where('userId').equals(userId).toArray();
    const resources = await db.resources.where('userId').equals(userId).toArray();

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
        updatedAt: gamification.updatedAt || 0,
      },
      achievements: {
        unlockedAchievements: achievements.unlockedAchievements,
        updatedAt: achievements.updatedAt || 0,
        // Include stats for mirroring
        stats: {
            currentStreak: achievements.currentStreak,
            totalTopicsCompleted: achievements.totalTopicsCompleted,
            subjectsFullyCompleted: achievements.subjectsFullyCompleted,
            totalStudyHours: achievements.totalStudyHours,
            totalSubjects: achievements.totalSubjects,
            longestSessionMinutes: achievements.longestSessionMinutes,
        }
      },
      writingChecker: {
        drafts: writingChecker.drafts,
        preferences: writingChecker.preferences,
        updatedAt: writingChecker.updatedAt || 0,
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
        updatedAt: english.updatedAt || 0,
      },
      user: {
        name: user.name,
        avatar: user.avatar,
        dailyGoalMinutes: user.dailyGoalMinutes,
        updatedAt: user.updatedAt || 0
      },
      timer: {
        todayStats: timer.todayStats as any,
        sessionHistory: timer.sessionHistory as any,
        config: timer.config as any,
        updatedAt: timer.updatedAt || 0,
      },
      lastResetAt: parseInt(localStorage.getItem('last_reset_at') || '0'),
      syllabus_version: localStorage.getItem('syllabus_version')
    };
  },

  async backup() {
    try {
      this._isSyncing = true;
      useSyncStore.getState().setSyncing(true);
      const data = await this.getAllLocalData();
      
      // SAFETY GUARD: Prevent backing up an empty state if we haven't loaded yet.
      // If we have 0 subjects but we aren't marked as "initialized" by the store, skip backup.
      if (!this._isInitialized && (!data.subjects || data.subjects.length === 0)) {
          console.warn('Sync service: Skipping backup - App not fully initialized and local data is empty.');
          return;
      }

      await api.post('/sync/backup', data);
      useSyncStore.getState().setLastSyncTime(Date.now());
      console.log('Sync service: BACKUP SUCCESS');
    } catch (err) {
      useSyncStore.getState().setError('Backup failed');
      console.error('Sync service: BACKUP FAILED', err);
    } finally {
      this._isSyncing = false;
      useSyncStore.getState().setSyncing(false);
    }
  },

  async restore() {
    if (this._isSyncing || this._isPaused) return;
    
    // Don't restore if we just had a local update (within 2 seconds) 
    if (Date.now() - this._lastLocalUpdate < 2000) {
      return;
    }

    const userId = getCurrentUserId();
    if (userId === 'guest') return; // Don't cloud sync guests

    try {
      this._isSyncing = true;
      useSyncStore.getState().setSyncing(true);
      const response = await api.get('/sync/restore');
      const remoteData = response.data;

      if (!remoteData) return;

      // 0. CHECK FOR CROSS-DEVICE RESET
      const localLastReset = parseInt(localStorage.getItem('last_reset_at') || '0');
      const remoteLastReset = remoteData.lastResetAt || 0;

      if (remoteLastReset > localLastReset) {
        console.warn('Sync: Remote reset detected. Enforcing full wipe/sync for:', userId);
        
        // 0.1 Update local reset timestamp IMMEDIATELY
        localStorage.setItem('last_reset_at', remoteLastReset.toString());
        
        // 0.2 Remove syllabus version to force re-initialization of presets if needed
        const versionKey = `syllabus_version_${userId}`;
        localStorage.removeItem(versionKey);
        
        // 0.3 Wipe local bucket for this user
        await syncService.wipeUserBucket(userId);
        
        // 0.4 Notify UI to re-load components
        window.dispatchEvent(new Event('storage'));
        
        // If the remote payload is just a reset signal (all arrays empty), we stop here after wiping.
        // This ensures a "Reset Account" on Device A results in a "Clean Slate" on Device B.
        const isActuallyEmpty = !remoteData.subjects?.length && !remoteData.topics?.length;
        if (isActuallyEmpty) {
            console.log('Sync: Reset applied. Cloud is empty.');
            return;
        }
      }

      // 1. Sync Dexie Tables with strict timestamp-based merge
      await db.transaction('rw', [db.subjects, db.topics, db.logs, db.timetable, db.settings, db.resources], async () => {
        const syncTable = async (table: any, remoteItems: any[]) => {
            const currentUserId = getCurrentUserId();
            const localItems = await table.where('userId').equals(currentUserId).toArray();
            
            const localMap = new Map(localItems.map((i: any) => [i.id, i]));
            // Also map by name for presets to handle ID shifts across devices
            const localPresetMap = new Map(
                localItems
                    .filter((i: any) => i.isPreset)
                    .map((i: any) => [`${i.parentId || 0}-${normalizeName(i.name)}`, i])
            );
            
            const toUpdate: any[] = [];
            const remoteIdsFoundInLocal = new Set<number>();
            const remotePresetKeysFoundInLocal = new Set<string>();

            for (const remoteItem of remoteItems) {
                let localItem = localMap.get(remoteItem.id) as any;
                const presetKey = remoteItem.isPreset ? `${remoteItem.parentId || 0}-${normalizeName(remoteItem.name)}` : null;
                
                if (!localItem && presetKey) {
                    localItem = localPresetMap.get(presetKey);
                }
                
                if (!localItem) {
                    // Item exists in cloud but not locally -> Add it
                    toUpdate.push({ ...remoteItem, userId: currentUserId });
                } else {
                    // Conflict Resolution: Latest updatedAt wins
                    const remoteUpdated = (remoteItem as any).updatedAt || 0;
                    const localUpdated = (localItem as any).updatedAt || 0;
                    
                    if (remoteUpdated > localUpdated) {
                        // Cloud is newer -> Pull update
                        toUpdate.push({
                            ...remoteItem,
                            id: localItem.id, // Keep local ID if it was matched by name
                            userId: currentUserId
                        });
                    }
                    
                    // Track that this item exists in both
                    if (localItem.id) remoteIdsFoundInLocal.add(localItem.id);
                    if (presetKey) remotePresetKeysFoundInLocal.add(presetKey);
                }
            }

            if (toUpdate.length > 0) {
                await table.bulkPut(toUpdate);
            }
            
            // Deletion: If it exists locally for this user but NOT in the cloud payload, 
            // and the cloud payload is NOT empty (meaning this isn't a partial sync error), delete it.
            // Note: We already handled the "Reset" case above which handles true empty states.
            if (remoteItems.length > 0 || remoteLastReset > localLastReset) {
                const toDelete = localItems
                    .filter((item: any) => {
                        if (item.isPreset) return !remotePresetKeysFoundInLocal.has(`${item.parentId || 0}-${normalizeName(item.name)}`);
                        return !remoteIdsFoundInLocal.has(item.id);
                    })
                    .map((item: any) => item.id);

                if (toDelete.length > 0) {
                    await table.bulkDelete(toDelete);
                }
            }
        };

        await syncTable(db.subjects, remoteData.subjects || []);
        await syncTable(db.topics, remoteData.topics || []);
        await syncTable(db.logs, remoteData.logs || []);
        await syncTable(db.timetable, remoteData.timetable || []);
        await syncTable(db.settings, remoteData.settings || []);
        await syncTable(db.resources, remoteData.resources || []);
      });

      // 2. Restore Zustand stores with Deterministic Merger (Latest Wins)
      if (remoteData.gamification) {
        const local = useGamificationStore.getState();
        const remote = remoteData.gamification;
        if ((remote.updatedAt || 0) > (local.updatedAt || 0)) {
            useGamificationStore.setState({
                xp: remote.xp,
                level: remote.level,
                unlockedBadges: remote.unlockedBadges || [],
                updatedAt: remote.updatedAt
            });
        }
      }
      
      if (remoteData.achievements) {
        const local = useAchievementsStore.getState();
        const remote = remoteData.achievements; // This matches the new payload structure
        if ((remote.updatedAt || 0) > (local.updatedAt || 0)) {
            useAchievementsStore.setState({ 
              unlockedAchievements: remote.unlockedAchievements || [],
              updatedAt: remote.updatedAt,
              ...(remote.stats || {}) // Mirror stats too
            });
        }
      }

      if (remoteData.writingChecker) {
        const local = useWritingCheckerStore.getState();
        const remote = remoteData.writingChecker;
        if ((remote.updatedAt || 0) > (local.updatedAt || 0)) {
            useWritingCheckerStore.setState({
                drafts: remote.drafts || [],
                preferences: remote.preferences || local.preferences,
                updatedAt: remote.updatedAt
            });
        }
      }
 
      if (remoteData.englishProgress) {
        const local = useEnglishStore.getState();
        const remote = remoteData.englishProgress;
        if ((remote.updatedAt || 0) > (local.updatedAt || 0)) {
            useEnglishStore.setState({ ...remote });
        }
      }
      
      if (remoteData.user) {
        const local = useUserStore.getState();
        const remote = remoteData.user;
        if ((remote.updatedAt || 0) > (local.updatedAt || 0)) {
            useUserStore.setState({
                name: remote.name,
                avatar: remote.avatar,
                dailyGoalMinutes: remote.dailyGoalMinutes,
                updatedAt: remote.updatedAt
            });
            
            const auth = useAuthStore.getState();
            if (auth.isAuthenticated) {
              auth.updateUser({
                name: remote.name,
                avatar: remote.avatar
              });
            }
        }
      }

      if (remoteData.timer) {
        const local = useTimerStore.getState();
        const remote = remoteData.timer;
        if ((remote.updatedAt || 0) > (local.updatedAt || 0)) {
            useTimerStore.setState({
                todayStats: remote.todayStats,
                sessionHistory: remote.sessionHistory,
                config: remote.config,
                updatedAt: remote.updatedAt
            });
        }
      }

      if (remoteData.quiz) {
          Object.entries(remoteData.quiz).forEach(([key, value]) => {
              if (typeof value === 'string') {
                  if (key.startsWith('quiz_completed_')) {
                      if (value === 'true' && localStorage.getItem(key) !== 'true') {
                          localStorage.setItem(key, value);
                      }
                  } else {
                      localStorage.setItem(key, value);
                  }
              }
          });
          window.dispatchEvent(new Event('storage'));
      }

      await useSubjectStore.getState().loadSubjects();
      await useSubjectStore.getState().loadAllTopics();
      await useLogStore.getState().loadAllLogs();
      await useTimetableStore.getState().loadTimetable();

      useSyncStore.getState().setLastSyncTime(Date.now());
      console.log('Restore successful');
    } catch (err: any) {
      useSyncStore.getState().setError('Restore failed');
      if (err.response?.status === 404) {
        console.log('No backup found in cloud, skipping restore');
        return;
      }
      console.error('Restore failed', err);
      throw err;
    } finally {
      this._isSyncing = false;
      useSyncStore.getState().setSyncing(false);
    }
  },

  async clearCloudData(lastResetAt?: number) {
    try {
      await api.delete('/sync/reset', { data: { lastResetAt } } as any);
      console.log('Cloud data cleared');
    } catch (err) {
      console.error('Failed to clear cloud data', err);
      throw err;
    }
  },

  async wipeUserBucket(userId: string) {
    await Promise.all([
        db.subjects.where('userId').equals(userId).delete(),
        db.topics.where('userId').equals(userId).delete(),
        db.logs.where('userId').equals(userId).delete(),
        db.timetable.where('userId').equals(userId).delete(),
        db.settings.where('userId').equals(userId).delete(),
        db.resources.where('userId').equals(userId).delete()
    ]);
  },

  async mergeGuestData() {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated || !user) throw new Error('Must be logged in to merge data');
    
    const userId = user.email;
    const guestId = 'guest';

    console.log(`🤝 Merging guest data into [${userId}]...`);

    await db.transaction('rw', [db.subjects, db.topics, db.logs, db.timetable, db.settings, db.resources], async () => {
        // 1. SUBJECTS (Complex Merge)
        const guestSubjects = await db.subjects.where('userId').equals(guestId).toArray();
        const userSubjects = await db.subjects.where('userId').equals(userId).toArray();
        
        const subjectMap = new Map<string, number>(); // key: parentId-name, value: userId-id
        userSubjects.forEach(s => subjectMap.set(`${s.parentId || 0}-${normalizeName(s.name)}`, s.id!));

        const guestToUserSubjectIdMap = new Map<number, number>();

        for (const gs of guestSubjects) {
            const key = `${gs.parentId || 0}-${normalizeName(gs.name)}`;
            const existingId = subjectMap.get(key);
            
            if (existingId) {
                console.log(`🤝 Merge: Subject [${gs.name}] already exists. Mapping ID ${gs.id} -> ${existingId}`);
                guestToUserSubjectIdMap.set(gs.id!, existingId);
                // Update local update time to ensure it syncs
                await db.subjects.update(existingId, { updatedAt: Date.now() });
            } else {
                const { id: oldId, ...data } = gs;
                const newId = await db.subjects.add({ ...data, userId, updatedAt: Date.now() }) as number;
                guestToUserSubjectIdMap.set(oldId!, newId);
                subjectMap.set(key, newId);
            }
        }

        // 2. TOPICS (Deduplicate by name + subjectId)
        const guestTopics = await db.topics.where('userId').equals(guestId).toArray();
        const userTopics = await db.topics.where('userId').equals(userId).toArray();
        
        const topicMap = new Map<string, number>(); // key: subjectId-name
        userTopics.forEach(t => topicMap.set(`${t.subjectId}-${normalizeName(t.name)}`, t.id!));

        for (const gt of guestTopics) {
            const newUserSubjectId = guestToUserSubjectIdMap.get(gt.subjectId);
            if (!newUserSubjectId) continue;

            const key = `${newUserSubjectId}-${normalizeName(gt.name)}`;
            const existingTopicId = topicMap.get(key);

            if (existingTopicId) {
                // Merge progress if guest topic is completed
                if (gt.status === 'completed' || gt.isCompleted) {
                    await db.topics.update(existingTopicId, { 
                        status: 'completed', 
                        isCompleted: true,
                        updatedAt: Date.now()
                    });
                }
            } else {
                const { id, ...data } = gt;
                await db.topics.add({ ...data, subjectId: newUserSubjectId, userId, updatedAt: Date.now() });
            }
        }

        // 3. LOGS, TIMETABLE, SETTINGS, RESOURCES (Simple Move/Update)
        const otherTables: any[] = [db.logs, db.timetable, db.settings, db.resources];
        for (const table of otherTables) {
            const guestItems = await table.where('userId').equals(guestId).toArray();
            for (const item of guestItems) {
                const { id, ...data } = item;
                // If it's a log, we need to map the subjectId
                let newData = { ...data, userId, updatedAt: Date.now() };
                if (table === db.logs && data.subjectId) {
                    newData.subjectId = guestToUserSubjectIdMap.get(data.subjectId) || data.subjectId;
                }
                await table.add(newData);
            }
        }

        // 4. CLEANUP GUEST DATA
        await this.wipeUserBucket(guestId);
    });

    console.log('🤝 Guest data merged and cleaned up.');
    await this.backup();
  },

  initAutoSync(intervalSeconds = 15) {
    const interval = intervalSeconds * 1000;
    setInterval(async () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated && !this._isSyncing && !this._isPaused) {
        try {
          await this.backup();
          await this.restore();
        } catch (err) {
          console.error('Auto-sync failed', err);
        }
      }
    }, interval);
  },

  _backupTimeout: null as any,
  triggerAutoBackup() {
    this._lastLocalUpdate = Date.now();
    if (this._backupTimeout) clearTimeout(this._backupTimeout);
    this._backupTimeout = setTimeout(() => {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated && !this._isPaused) {
        this.backup().catch(console.error);
      }
    }, 1000); // Reduced to 1 second for "Mirror" effect
  }
};
