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
import api from './api';

const getCurrentUserId = () => {
  const { user, isAuthenticated } = useAuthStore.getState();
  return isAuthenticated && user ? user.email : 'guest';
};

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
      },
      lastResetAt: parseInt(localStorage.getItem('last_reset_at') || '0'),
      syllabus_version: localStorage.getItem('syllabus_version')
    };
  },

  async backup() {
    if (this._isSyncing || this._isPaused) return;
    try {
      this._isSyncing = true;
      const data = await this.getAllLocalData();
      await api.post('/sync/backup', data);
      console.log('Sync service: BACKUP SUCCESS');
    } catch (err) {
      console.error('Sync service: BACKUP FAILED', err);
    } finally {
      this._isSyncing = false;
    }
  },

  async restore() {
    if (this._isSyncing || this._isPaused) return;
    
    // Don't restore if we just had a local update (within 5 seconds) 
    if (Date.now() - this._lastLocalUpdate < 5000) {
      return;
    }

    const userId = getCurrentUserId();
    if (userId === 'guest') return; // Don't cloud sync guests

    try {
      this._isSyncing = true;
      const response = await api.get('/sync/restore');
      const remoteData = response.data;

      if (!remoteData) return;

      // 0. CHECK FOR CROSS-DEVICE RESET
      const localLastReset = parseInt(localStorage.getItem('last_reset_at') || '0');
      const remoteLastReset = remoteData.lastResetAt || 0;

      if (remoteLastReset > localLastReset) {
        // SAFETY: If localLastReset is 0, this is a fresh login or first sync of this session.
        // We should just adopt the remote timestamp without wiping the local bucket,
        // because the bootstrapper just initialized fresh presets we want to KEEP.
        if (localLastReset === 0) {
            console.log('Sync: Adopting remote reset timestamp:', remoteLastReset);
            localStorage.setItem('last_reset_at', remoteLastReset.toString());
        } else {
            console.warn('Sync: Remote reset detected. Wiping local bucket for:', userId);
            const versionKey = `syllabus_version_${userId}`;
            localStorage.setItem('last_reset_at', remoteLastReset.toString());
            localStorage.removeItem(versionKey);
            
            await syncService.wipeUserBucket(userId);
            
            // Softer reload: just trigger storage event to re-bootstrap or rely on next update
            window.dispatchEvent(new Event('storage'));
            console.log('Sync: Reset applied. Re-initialization will trigger on next bootstrap.');
            return;
        }
      }

      // 1. Sync Dexie Tables with smart merge
      await db.transaction('rw', [db.subjects, db.topics, db.logs, db.timetable, db.settings, db.resources], async () => {
        const syncTable = async (table: any, remoteItems: any[]) => {
            const currentUserId = getCurrentUserId();
            // Fetch local items for this user
            const localItems = await table.where('userId').equals(currentUserId).toArray();
            
            // SAFETY: If remote is empty but we have local data, do NOT delete local data yet.
            // This prevents a fresh account (empty cloud) from wiping newly initialized presets.
            // We only proceed with deletion if the remote payload actually has data to sync.
            const hasRemoteData = remoteItems && remoteItems.length > 0;
            const hasLocalData = localItems && localItems.length > 0;
            const shouldSkipWipe = !hasRemoteData && hasLocalData;

            if (!remoteItems) return;
            
            const localMap = new Map(localItems.map((i: any) => [i.id, i]));
            const localNameMap = new Map(localItems.filter((i: any) => i.isPreset).map((i: any) => [`${i.parentId || 0}-${normalizeName(i.name)}`, i]));
            
            const toUpdate: any[] = [];
            
            for (const remoteItem of remoteItems) {
                let localItem = localMap.get(remoteItem.id) as any;
                if (!localItem && remoteItem.isPreset) {
                    localItem = localNameMap.get(`${remoteItem.parentId || 0}-${normalizeName(remoteItem.name)}`);
                }
                
                if (!localItem) {
                    toUpdate.push({ ...remoteItem, userId: currentUserId });
                } else {
                    const remoteUpdated = (remoteItem as any).updatedAt || 0;
                    const localUpdated = (localItem as any).updatedAt || 0;
                    const mergedIsCompleted = localItem.isCompleted || remoteItem.isCompleted;
                    
                    if (remoteUpdated > localUpdated) {
                        toUpdate.push({
                            ...remoteItem,
                            id: localItem.id,
                            userId: currentUserId,
                            isCompleted: mergedIsCompleted 
                        });
                    } else if (mergedIsCompleted && !localItem.isCompleted) {
                        toUpdate.push({
                            ...localItem,
                            isCompleted: true,
                            updatedAt: Date.now() 
                        });
                    }
                }
            }

            if (toUpdate.length > 0) {
                await table.bulkPut(toUpdate);
            }
            
            // Deletion logic - skipped if we have local data but empty remote (safety lock)
            if (!shouldSkipWipe) {
                const remoteIds = new Set(remoteItems.map((i: any) => i.id));
                const remoteNameKeys = new Set(remoteItems.filter((i: any) => i.isPreset).map((i: any) => `${i.parentId || 0}-${normalizeName(i.name)}`));
                
                const toDelete = localItems
                    .filter((item: any) => {
                        if (item.isPreset) return !remoteNameKeys.has(`${item.parentId || 0}-${normalizeName(item.name)}`);
                        return !remoteIds.has(item.id);
                    })
                    .map((item: any) => item.id);

                if (toDelete.length > 0) {
                    await table.bulkDelete(toDelete);
                }
            } else {
                console.log(`Sync: Skipping wipe for ${table.name} to protect local data from empty remote payload.`);
            }
        };

        await syncTable(db.subjects, remoteData.subjects || []);
        await syncTable(db.topics, remoteData.topics || []);
        await syncTable(db.logs, remoteData.logs || []);
        await syncTable(db.timetable, remoteData.timetable || []);
        await syncTable(db.settings, remoteData.settings || []);
        await syncTable(db.resources, remoteData.resources || []);
      });

      // Restore Zustand stores...
      if (remoteData.gamification) {
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
          drafts: remoteData.writingChecker.drafts || [],
          preferences: remoteData.writingChecker.preferences || { targetDailyWords: 500 },
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
          config: remoteData.timer.config
        });
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
    }, 2000);
  }
};
