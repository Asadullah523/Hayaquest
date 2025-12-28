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
import { generateDeterministicSyncId, generateRandomSyncId, getLegacySubjectKey, getLegacyTopicKey } from '../utils/syncUtils';
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
    const ensureSyncId = async (table: any, items: any[], type: 'subject' | 'topic' | 'other' = 'other') => {
        const toUpdate = items.filter(i => !i.syncId);
        for (const item of toUpdate) {
            let syncId: string;
            if (type === 'subject' && item.isPreset) {
                // Hierarchical reconstruction for Presets
                if (!item.parentId || item.parentId === 0) {
                    const name = item.name.toLowerCase();
                    const prefix = name.includes('imat') ? 'imat' : 
                                 name.includes('mdcat') ? 'mdcat' : 
                                 name.includes('biology') ? 'biology' :
                                 name.includes('chemistry') ? 'chemistry' :
                                 name.includes('physics') ? 'physics' : 'custom';
                    syncId = generateDeterministicSyncId('subject', prefix);
                } else {
                    // It's a child. Try to find the parent to build the path
                    const parent = items.find(s => s.id === item.parentId);
                    if (parent && parent.syncId) {
                        const parentPath = parent.syncId.split(':')[1];
                        syncId = generateDeterministicSyncId('subject', `${parentPath}:${item.name.toLowerCase().replace(/ /g, '_')}`);
                    } else {
                        syncId = generateRandomSyncId();
                    }
                }
            } else {
                syncId = generateRandomSyncId();
            }
            item.syncId = syncId;
            await table.update(item.id, { syncId, updatedAt: Date.now() });
        }
        return items;
    };

    // Get data from Dexie filtered by userId and ensure syncIds exist
    const allSubjects = await ensureSyncId(db.subjects, await db.subjects.where('userId').equals(userId).toArray(), 'subject');
    const allTopics = await ensureSyncId(db.topics, await db.topics.where('userId').equals(userId).toArray(), 'topic');
    
    // CRITICAL FIX: Exclude preset subjects and topics from cloud backup
    // Preset subjects are structural data that should be initialized locally, not synced
    const subjects = allSubjects.filter(s => !s.isPreset);
    const topics = allTopics.filter(t => {
      // Only include topics that belong to user-created subjects (non-preset)
      const subject = allSubjects.find(s => s.id === t.subjectId);
      return subject && !subject.isPreset;
    });
    
    const logs = await ensureSyncId(db.logs, await db.logs.where('userId').equals(userId).toArray());
    const timetable = await ensureSyncId(db.timetable, await db.timetable.where('userId').equals(userId).toArray());
    const settings = await ensureSyncId(db.settings, await db.settings.where('userId').equals(userId).toArray());
    const resources = await ensureSyncId(db.resources, await db.resources.where('userId').equals(userId).toArray());

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

    
    console.log(`📦 Backup: ${allSubjects.length} total subjects (${subjects.length} user-created, ${allSubjects.length - subjects.length} preset skipped)`);
    console.log(`📦 Backup: ${allTopics.length} total topics (${topics.length} user-created, ${allTopics.length - topics.length} preset skipped)`);

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
      console.log(`✅ Sync service: BACKUP SUCCESS (${data.subjects.length} user subjects, ${data.topics.length} user topics)`);
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

      // 0. MIGRATION: Clean preset subjects from cloud backup
      // This fixes existing users who have preset subjects in their cloud data
      if (remoteData.subjects && remoteData.subjects.length > 0) {
        const preCleanCount = remoteData.subjects.length;
        remoteData.subjects = remoteData.subjects.filter((s: any) => !s.isPreset);
        
        // Also filter out topics that belong to preset subjects
        if (remoteData.topics && remoteData.topics.length > 0) {
          const presetSubjectIds = new Set(
            (await db.subjects.where('userId').equals(userId).toArray())
              .filter(s => s.isPreset)
              .map(s => s.id)
          );
          remoteData.topics = remoteData.topics.filter((t: any) => !presetSubjectIds.has(t.subjectId));
        }
        
        const postCleanCount = remoteData.subjects.length;
        if (preCleanCount !== postCleanCount) {
          console.log(`🧹 Cloud Migration: Removed ${preCleanCount - postCleanCount} preset subjects from remote data`);
        }
      }

      // 1. CHECK FOR CROSS-DEVICE RESET
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

      // 2. Sync Dexie Tables with Global SyncID matching
      await db.transaction('rw', [db.subjects, db.topics, db.logs, db.timetable, db.settings, db.resources], async () => {
        const currentUserId = getCurrentUserId();
        
        // 2.1 SUBJECTS FIRST (Hierarchy anchor)
        const localSubjects = await db.subjects.where('userId').equals(currentUserId).toArray();
        const remoteSubjects = remoteData.subjects || [];
        const syncIdToLocalSubjectId = new Map<string, number>();
        

        // Build existing map and legacy map
        localSubjects.forEach(s => { 
            if (s.syncId) syncIdToLocalSubjectId.set(s.syncId, s.id!); 
        });
        const legacyLocalSubjectMap = new Map(localSubjects.map(s => [getLegacySubjectKey(s), s]));

        for (const remote of remoteSubjects) {
            // CRITICAL: Skip preset subjects - they're defined in code, not cloud
            // This prevents cloud data from overwriting IMAT Prep, Mathematics, etc.
            if (remote.isPreset) {
                console.log(`⏭️  Skipping preset subject from cloud: ${remote.name}`);
                continue;
            }
            
            const localIdBySyncId = remote.syncId ? syncIdToLocalSubjectId.get(remote.syncId) : null;
            const localByLegacy = legacyLocalSubjectMap.get(getLegacySubjectKey(remote));
            const local = localIdBySyncId || localByLegacy?.id;
            
            if (!local) {
                // ADD: Discard remote local ID
                const { id, parentId, ...clean } = remote;
                const newId = await db.subjects.add({ ...clean, parentId: 0, userId: currentUserId }) as number;
                if (remote.syncId) syncIdToLocalSubjectId.set(remote.syncId, newId);
            } else {
                // MERGE: Latest wins
                const localData = localByLegacy || localSubjects.find(s => s.id === local);
                if ((remote.updatedAt || 0) > (localData?.updatedAt || 0)) {
                    const { id, parentId, ...clean } = remote;
                    await db.subjects.update(local, { ...clean, userId: currentUserId });
                }
                // Backfill syncId if missing locally
                if (remote.syncId) {
                    syncIdToLocalSubjectId.set(remote.syncId, local);
                    if (!localData?.syncId) await db.subjects.update(local, { syncId: remote.syncId });
                }
            }
        }

        const remoteSyncIdToParentSyncIdEntries: [string, string | undefined][] = remoteSubjects.map((s: any) => {
            const parent = remoteSubjects.find((ps: any) => ps.id === s.parentId);
            return [s.syncId, parent?.syncId] as [string, string | undefined];
        });
        const remoteSyncIdToParentSyncId = new Map(remoteSyncIdToParentSyncIdEntries);
        
        for (const remote of remoteSubjects) {
            if (!remote.syncId) continue;
            const localId = syncIdToLocalSubjectId.get(remote.syncId);
            const parentSyncId = remoteSyncIdToParentSyncId.get(remote.syncId);
            
            if (localId && parentSyncId) {
                const localParentId = syncIdToLocalSubjectId.get(parentSyncId);
                if (localParentId) {
                    await db.subjects.update(localId, { parentId: localParentId });
                }
            } else if (localId) {
                // Ensure roots are 0
                await db.subjects.update(localId, { parentId: 0 });
            }
        }

        // 2.3 TOPICS (Link to Subject by syncId or legacy mapping)
        const localTopics = await db.topics.where('userId').equals(currentUserId).toArray();
        const remoteTopics = remoteData.topics || [];
        const syncIdToLocalTopicId = new Map<string, number>();
        localTopics.forEach(t => { if (t.syncId) syncIdToLocalTopicId.set(t.syncId, t.id!); });
        
        const legacyLocalTopicMap = new Map(localTopics.map(t => [getLegacyTopicKey(t), t]));

        for (const remote of remoteTopics) {
            const localIdBySyncId = remote.syncId ? syncIdToLocalTopicId.get(remote.syncId) : null;
            const localByLegacy = legacyLocalTopicMap.get(getLegacyTopicKey(remote));
            const localId = localIdBySyncId || localByLegacy?.id;

            const remoteSubject = remoteSubjects.find((s: any) => s.id === remote.subjectId);
            const remoteSubjectSyncId = remoteSubject?.syncId;
            const localSubjectId = remoteSubjectSyncId ? syncIdToLocalSubjectId.get(remoteSubjectSyncId) : null;

            if (!localId) {
                const { id, subjectId, ...clean } = remote;
                await db.topics.add({ 
                    ...clean, 
                    subjectId: localSubjectId || 0, 
                    userId: currentUserId 
                });
            } else {
                const localData = localByLegacy || localTopics.find(t => t.id === localId);
                if ((remote.updatedAt || 0) > (localData?.updatedAt || 0)) {
                    const { id, subjectId, ...clean } = remote;
                    await db.topics.update(localId, { 
                        ...clean, 
                        subjectId: localSubjectId || localData?.subjectId || 0,
                        userId: currentUserId 
                    });
                }
                // Backfill syncId if missing
                if (remote.syncId && !localData?.syncId) await db.topics.update(localId, { syncId: remote.syncId });
            }
        }

        // 2.4 OTHER TABLES (Simple syncId match)
        const syncSimpleTable = async (table: any, remoteItems: any[], localItems: any[]) => {
            const localMap = new Map<string, number>();
            localItems.forEach(i => { if (i.syncId) localMap.set(i.syncId, i.id!); });

            for (const remote of remoteItems) {
                if (!remote.syncId) continue;
                const localId = localMap.get(remote.syncId);
                if (!localId) {
                    const { id, ...clean } = remote;
                    await table.add({ ...clean, userId: currentUserId });
                } else {
                    const localData = localItems.find(i => i.id === localId);
                    if ((remote.updatedAt || 0) > (localData?.updatedAt || 0)) {
                        const { id, ...clean } = remote;
                        await table.update(localId, { ...clean, userId: currentUserId });
                    }
                }
            }
        };

        await syncSimpleTable(db.logs, remoteData.logs || [], await db.logs.where('userId').equals(currentUserId).toArray());
        await syncSimpleTable(db.timetable, remoteData.timetable || [], await db.timetable.where('userId').equals(currentUserId).toArray());
        await syncSimpleTable(db.settings, remoteData.settings || [], await db.settings.where('userId').equals(currentUserId).toArray());
        await syncSimpleTable(db.resources, remoteData.resources || [], await db.resources.where('userId').equals(currentUserId).toArray());

        // 2.5 DELETIONS (SyncId based - EXTRA CAREFUL)
        const cleanupDeleted = async (table: any, localItems: any[], remoteItems: any[]) => {
            // Safety: Never delete if remote is empty unless it's a confirmed reset
            if (remoteItems.length === 0 && remoteLastReset <= localLastReset) return;
            
            // Safety: If remote has NO syncIds, it's an old payload. Don't delete new local items.
            const remoteHasSyncIds = remoteItems.some(i => i.syncId);
            if (!remoteHasSyncIds) return;

            const remoteSyncIds = new Set(remoteItems.map(i => i.syncId).filter(Boolean));
            
            // 🚨 CRITICAL FIX: Never delete preset items, even if missing from cloud
            const toDelete = localItems
                .filter(i => i.syncId && !i.isPreset && !remoteSyncIds.has(i.syncId))
                .map(i => i.id);
                
            if (toDelete.length > 0) {
                console.log(`Sync Cleanup: Deleting ${toDelete.length} items from ${table.name}`);
                await table.bulkDelete(toDelete);
            }
        };

        await cleanupDeleted(db.subjects, localSubjects, remoteSubjects);
        await cleanupDeleted(db.topics, localTopics, remoteTopics);
        await cleanupDeleted(db.logs, await db.logs.where('userId').equals(currentUserId).toArray(), remoteData.logs || []);
        await cleanupDeleted(db.timetable, await db.timetable.where('userId').equals(currentUserId).toArray(), remoteData.timetable || []);
        await cleanupDeleted(db.settings, await db.settings.where('userId').equals(currentUserId).toArray(), remoteData.settings || []);
        await cleanupDeleted(db.resources, await db.resources.where('userId').equals(currentUserId).toArray(), remoteData.resources || []);
      });

      // 3. Restore Zustand stores with Deterministic Merger (Latest Wins)
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
        // 1. SUBJECTS (Complex Merge) - SKIP PRESET SUBJECTS
        const guestSubjects = await db.subjects.where('userId').equals(guestId).toArray();
        const userSubjects = await db.subjects.where('userId').equals(userId).toArray();
        
        // Filter out preset subjects from guest - they should exist on both sides already
        const guestCustomSubjects = guestSubjects.filter(s => !s.isPreset);
        
        const subjectMap = new Map<string, number>(); // key: parentId-name, value: userId-id
        userSubjects.forEach(s => subjectMap.set(`${s.parentId || 0}-${normalizeName(s.name)}`, s.id!));

        const guestToUserSubjectIdMap = new Map<number, number>();
        
        if (guestCustomSubjects.length === 0) {
            console.log('🤝 Merge: No custom guest subjects to merge. Skipping subject merge.');
        } else {
            console.log(`🤝 Merge: Found ${guestCustomSubjects.length} custom guest subjects to merge.`);

            for (const gs of guestCustomSubjects) {
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

        // REMOVED: Wipe guest bucket
        // We now PRESERVE guest data after merge so users can:
        // 1. Continue using guest mode if needed
        // 2. Avoid data loss if something goes wrong
        // Guest and logged-in data are separate buckets anyway
    });

    // 4. MERGE localStorage quiz progress with MAX strategy
    // Quiz completion is stored in localStorage (GLOBAL, not user-specific):
    // - quiz_completed_{paperId}: Paper fully completed flag  
    // - quiz_progress_{paperId}: Current progress (JSON with score, answers, etc.)
    //
    // CRITICAL: localStorage is SHARED between guest and logged-in user!
    // When user logs in, the quiz data is still there from guest mode.
    // We just need to ensure it's backed up to cloud.
    
    console.log('🔄 Preserving quiz progress in cloud backup...');
    
    // Count quiz items in localStorage
    let quizItemCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('quiz_completed_') || key.startsWith('quiz_progress_'))) {
            quizItemCount++;
        }
    }
    
    console.log(`✅ Found ${quizItemCount} quiz items to preserve.`);
    
    // Since localStorage is already shared, all guest quiz data is available
    // to the logged-in user. We just need to back it up to cloud.
    await this.backup();

    console.log('🤝 Guest data merged successfully (quiz progress preserved in cloud).');
  },

  initAutoSync(intervalSeconds = 15) {
    const interval = intervalSeconds * 1000;
    setInterval(async () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated && !this._isSyncing && !this._isPaused) {
        try {
          await this.backup();
          // After backup, we restore to keep in sync with other devices
          // But we don't want to restore if we just backed up the same data.
          // However, the restore logic handles updatedAt correctly.
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
