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
import { initializePresetSubjects } from '../utils/initializePresetSubjects';
import api from './api';

const getCurrentUserId = () => {
  const { user, isAuthenticated } = useAuthStore.getState();
  return isAuthenticated && user ? user.email.toLowerCase() : 'guest';
};

export const syncService = {
  // Sync state management
  _isSyncing: false,
  _isPaused: false,
  _isInitialized: false, // New: guard against backup before first load
  _lastLocalUpdate: 0,
  _lastRestoreTime: 0, // Track the last time we successfully synced with cloud
  _autoSyncInterval: null as any,


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

  async ensureAllSyncIds() {
    const userId = getCurrentUserId();
    const helper = async (table: any, items: any[], type: 'subject' | 'topic' | 'other' = 'other') => {
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
                                 name.includes('physics') ? 'physics' : 
                                 name.includes('math') ? 'math' : 'custom';
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
    };

    const subjects = await db.subjects.where('userId').equals(userId).toArray();
    const topics = await db.topics.where('userId').equals(userId).toArray();
    const logs = await db.logs.where('userId').equals(userId).toArray();
    const timetable = await db.timetable.where('userId').equals(userId).toArray();
    const settings = await db.settings.where('userId').equals(userId).toArray();
    const resources = await db.resources.where('userId').equals(userId).toArray();

    await helper(db.subjects, subjects, 'subject');
    await helper(db.topics, topics, 'topic');
    await helper(db.logs, logs);
    await helper(db.timetable, timetable);
    await helper(db.settings, settings);
    await helper(db.resources, resources);
    
    return { subjects, topics, logs, timetable, settings, resources };
  },

  async getAllLocalData() {
    const userId = getCurrentUserId();
    // Ensure all local items have IDs before backup
    await this.ensureAllSyncIds();

    const subjects = await db.subjects.where('userId').equals(userId).toArray();
    const topics = await db.topics.where('userId').equals(userId).toArray();
    const logs = await db.logs.where('userId').equals(userId).toArray();
    const timetable = await db.timetable.where('userId').equals(userId).toArray();
    const settings = await db.settings.where('userId').equals(userId).toArray();
    const resources = await db.resources.where('userId').equals(userId).toArray();
    
    // We no longer filter out presets here. 
    // This ensures that topic completion (progress) for IMAT/MDCAT is uploaded to cloud.
    // The restore() logic will safely handle structural vs progress updates.
    
    // Data is now ready with syncIds

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

    
    console.log(`📦 Backup: ${subjects.length} total subjects (including presets)`);
    console.log(`📦 Backup: ${topics.length} total topics (including presets)`);

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
      timetableStore: {
          completedSlots: useTimetableStore.getState().completedSlots,
          updatedAt: Date.now()
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
      const now = Date.now();
      this._lastRestoreTime = now;
      useSyncStore.getState().setLastSyncTime(now);
      console.log(`✅ Sync service: BACKUP SUCCESS (${data.subjects.length} user subjects, ${data.topics.length} user topics)`);
    } catch (err) {
      useSyncStore.getState().setError('Backup failed');
      console.error('Sync service: BACKUP FAILED', err);
    } finally {
      this._isSyncing = false;
      useSyncStore.getState().setSyncing(false);
    }
  },

  async restore(force = false) {
    if (this._isSyncing || this._isPaused) return;
    
    // Don't restore if we just had a local update (within 10 seconds)
    // UNLESS it's a forced restore (e.g. app startup)
    if (!force && Date.now() - this._lastLocalUpdate < 10000) {
      console.log('Sync: Skipping restore (Recent local update)');
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

      // 0. ENSURE LOCAL INTEGRITY
      // Before restore, ensure local presets have their deterministic IDs for mapping
      await this.ensureAllSyncIds();


      // Migration phase removed: Presets are now part of the global cloud state to sync progress.

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
            const local = localIdBySyncId || (localByLegacy ? localByLegacy.id : null);
            
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

        // 2.4 OTHER TABLES (Simple & Relational Sync)
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

        const syncTableWithSubjectMapping = async (table: any, remoteItems: any[], localItems: any[], type: 'timetable' | 'log') => {
            const localMap = new Map<string, number>();
            localItems.forEach(i => { if (i.syncId) localMap.set(i.syncId, i.id!); });

            for (const remote of remoteItems) {
                if (!remote.syncId) continue;

                // 2. Resolve Subject ID mapping
                let localSubjectId = 0;
                if (remote.subjectId) {
                    const remoteSubject = remoteSubjects.find((s: any) => s.id === remote.subjectId);
                    if (remoteSubject) {
                        if (remoteSubject.syncId) {
                            localSubjectId = syncIdToLocalSubjectId.get(remoteSubject.syncId) || 0;
                        }
                        
                        // FALLBACK: Match by name
                        if (!localSubjectId) {
                            const localMatch = localSubjects.find(s => normalizeName(s.name) === normalizeName(remoteSubject.name));
                            if (localMatch) localSubjectId = localMatch.id || 0;
                        }
                    }
                }

                // Resolve Local Topic ID (for logs)
                let localTopicId = 0;
                if (type === 'log' && remote.topicId) {
                    const remoteTopic = remoteTopics.find((t: any) => t.id === remote.topicId);
                    if (remoteTopic && remoteTopic.syncId) {
                        const mappedId = syncIdToLocalTopicId.get(remoteTopic.syncId);
                        if (mappedId) localTopicId = mappedId;
                    }
                }

                const localId = localMap.get(remote.syncId);
                const { id, ...clean } = remote;
                const payload = { 
                    ...clean, 
                    userId: currentUserId,
                    subjectId: localSubjectId // Use mapped ID, default 0
                };

                if (type === 'log' && localTopicId) {
                    payload.topicId = localTopicId;
                }

                if (!localId) {
                    await table.add(payload);
                } else {
                    const localData = localItems.find(i => i.id === localId);
                    if ((remote.updatedAt || 0) > (localData?.updatedAt || 0)) {
                        await table.update(localId, payload);
                    }
                }
            }
        };

        // Sync Logs and Timetable with mapping
        await syncTableWithSubjectMapping(db.logs, remoteData.logs || [], await db.logs.where('userId').equals(currentUserId).toArray(), 'log');
        await syncTableWithSubjectMapping(db.timetable, remoteData.timetable || [], await db.timetable.where('userId').equals(currentUserId).toArray(), 'timetable');
        
        // Settings and Resources are simple
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
            
            // 🚨 CRITICAL FIX: Never delete preset items or core syllabus roots, even if missing from cloud
            const protectedNames = ['IMAT Prep', 'MDCAT Prep', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Math'];
            const toDelete = localItems
                .filter(i => {
                    // SAFETY: Don't delete items updated locally in the last 30 seconds
                    // This prevents race conditions where a new local item hasn't reached cloud yet
                    const isRecent = (i.updatedAt || 0) > (Date.now() - 30000);
                    const isProtected = i.isPreset || (table.name === 'subjects' && protectedNames.some(pn => normalizeName(i.name) === normalizeName(pn)));
                    
                    if (isRecent) return false;

                    return i.syncId && !isProtected && !remoteSyncIds.has(i.syncId);
                })
                .map(i => i.id);
                
            if (toDelete.length > 0) {
                console.warn(`🔥 Sync Cleanup: Deleting ${toDelete.length} items from ${table.name}`);
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
      
      // CRITICAL: Ensure structural integrity after restore
      // If any preset subjects were lost or have invalid parentIds, this recreates them
      try {
          const { initializePresetSubjects } = await import('../utils/initializePresetSubjects');
          await initializePresetSubjects();
          // Reload stores after structural fix
          await Promise.all([
              useSubjectStore.getState().loadSubjects(),
              useSubjectStore.getState().loadAllTopics()
          ]);
      } catch (err) {
          console.error('Post-restore re-initialization failed:', err);
      }

      await useLogStore.getState().loadAllLogs();
      await useTimetableStore.getState().loadTimetable();

      // Restore Timetable Completions (ID Remapping Required)
      if (remoteData.timetableStore && remoteData.timetableStore.completedSlots) {
          const remoteCompleted = remoteData.timetableStore.completedSlots; // { "2023-12-01": [5, 6] }
          console.log('🔄 Restore: Found remote completed slots:', remoteCompleted);
          
          const localTimetable = await db.timetable.where('userId').equals(userId).toArray(); // Contains current local IDs and syncIds
          const remoteTimetable = remoteData.timetable || []; // Contains remote IDs and syncIds

          const mappedCompletedSlots: Record<string, number[]> = {};

          Object.entries(remoteCompleted).forEach(([date, slotIds]) => {
              const mappedIds = (slotIds as number[]).map(remoteId => {
                  // 1. Find Remote ID -> Sync ID
                  const remoteSlot = remoteTimetable.find((s: any) => s.id === remoteId);
                  
                  if (!remoteSlot) {
                      console.warn(`⚠️ Restore: Remote slot ${remoteId} not found in remote timetable.`);
                      return null;
                  }
                  if (!remoteSlot.syncId) {
                      console.warn(`⚠️ Restore: Remote slot ${remoteId} has no SyncID.`);
                      return null;
                  }

                  // 2. Find Sync ID -> Local ID
                  const localSlot = localTimetable.find(s => s.syncId === remoteSlot.syncId);
                  
                  if (!localSlot) {
                      console.warn(`⚠️ Restore: Local slot with SyncID ${remoteSlot.syncId} not found.`);
                      return null;
                  }

                  return localSlot.id;
              }).filter(id => id !== null) as number[];

              if (mappedIds.length > 0) {
                  mappedCompletedSlots[date] = mappedIds;
              }
          });
          
          console.log('✅ Restore: Mapped completed slots:', mappedCompletedSlots);
          
          useTimetableStore.setState({ 
              completedSlots: mappedCompletedSlots
              // We don't overwrite other state like startHour/endHour unless we want to sync settings too
          });
      } else {
          console.log('ℹ️ Restore: No completedSlots found in remote backup.');
      }

      const now = Date.now();
      this._lastRestoreTime = now;
      useSyncStore.getState().setLastSyncTime(now);
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

  async previewMerge() {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated || !user) return null;
    
    const userId = user.email;
    const guestId = 'guest';

    // Helper to calculate % for a user bucket
    const calculateProgress = async (uid: string, subjectName: string) => {
        // Find subject(s) matching name (handling duplicates/presets)
        const allSubjects = await db.subjects.where('userId').equals(uid).toArray();
        const targets = allSubjects.filter(s => normalizeName(s.name).includes(normalizeName(subjectName)));
        
        if (targets.length === 0) return 0;
        
        let totalTopics = 0;
        let completedTopics = 0;
        
        for (const subj of targets) {
            const topics = await db.topics.where('subjectId').equals(subj.id!).toArray();
            totalTopics += topics.length;
            completedTopics += topics.filter(t => t.isCompleted || t.status === 'completed').length;
            
            // Also check children
            const children = allSubjects.filter(s => s.parentId === subj.id);
            for (const child of children) {
                const childTopics = await db.topics.where('subjectId').equals(child.id!).toArray();
                totalTopics += childTopics.length;
                completedTopics += childTopics.filter(t => t.isCompleted || t.status === 'completed').length;
            }
        }
        
        return totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
    };

    const coreSubjects = ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'IMAT Prep', 'MDCAT Prep'];
    const details = [];

    for (const name of coreSubjects) {
        const guestPct = await calculateProgress(guestId, name);
        const userPct = await calculateProgress(userId, name);
        
        // Only include if there's a difference/progress
        if (guestPct > 0 || userPct > 0) {
            details.push({
                name,
                guest: guestPct,
                user: userPct,
                result: Math.max(guestPct, userPct)
            });
        }
    }
    
    // Also count raw items
    const guestTopics = await db.topics.where('userId').equals(guestId).count();
    const guestLogs = await db.logs.where('userId').equals(guestId).count();

    return {
        details,
        stats: {
            topics: guestTopics,
            logs: guestLogs
        }
    };
  },

  async mergeGuestData() {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated || !user) throw new Error('Must be logged in to merge data');
    
    const userId = user.email;
    const guestId = 'guest';

    console.log(`🤝 Merging guest data into [${userId}] with MAX WINS logic...`);

    // 0. ENSURE DESTINATION SUBJECTS EXIST
    console.log('Merge: Initializing preset subjects for user...');
    await initializePresetSubjects();

    await db.transaction('rw', [db.subjects, db.topics, db.logs, db.timetable, db.settings, db.resources], async () => {
        // 1. SUBJECTS MAPPING
        const guestSubjects = await db.subjects.where('userId').equals(guestId).toArray();
        const userSubjects = await db.subjects.where('userId').equals(userId).toArray();
        
        const subjectMap = new Map<string, number>(); // key: parentId-name, value: userId-id
        userSubjects.forEach(s => subjectMap.set(`${s.parentId || 0}-${normalizeName(s.name)}`, s.id!));

        const guestToUserSubjectIdMap = new Map<number, number>();
        
        for (const gs of guestSubjects) {
            // Logic to match preset or custom subjects
            const key = `${gs.parentId || 0}-${normalizeName(gs.name)}`;
            const existingId = subjectMap.get(key);
            
            if (existingId) {
                guestToUserSubjectIdMap.set(gs.id!, existingId);
            } else if (!gs.isPreset) {
                // Create missing CUSTOM subject
                const { id: oldId, ...data } = gs;
                const newId = await db.subjects.add({ ...data, userId, updatedAt: Date.now() }) as number;
                guestToUserSubjectIdMap.set(oldId!, newId);
                subjectMap.set(key, newId);
            }
             // Presets are now guaranteed to exist due to Step 0
        }

        // 2. TOPICS (MAX WINS LOGIC)
        const guestTopics = await db.topics.where('userId').equals(guestId).toArray();
        const userTopics = await db.topics.where('userId').equals(userId).toArray();
        
        const topicMap = new Map<string, any>(); // key: subjectId-name -> Topic
        userTopics.forEach(t => topicMap.set(`${t.subjectId}-${normalizeName(t.name)}`, t));

        for (const gt of guestTopics) {
            const newUserSubjectId = guestToUserSubjectIdMap.get(gt.subjectId);
            
            // If we can't map the subject ID, try finding it by Name/Legacy Key since initPresets ran
            let targetSubjectId = newUserSubjectId;
            if (!targetSubjectId) {
                 const guestSubject = guestSubjects.find(s => s.id === gt.subjectId);
                 if (guestSubject) {
                     const key = `${guestSubject.parentId || 0}-${normalizeName(guestSubject.name)}`;
                     const mappedId = subjectMap.get(key);
                     if (mappedId) targetSubjectId = mappedId;
                 }
            }

            if (!targetSubjectId) continue;

            const key = `${targetSubjectId}-${normalizeName(gt.name)}`;
            const existingTopic = topicMap.get(key);

            if (existingTopic) {
                // MAX WINS: If guest is done but user isn't, mark user as done.
                if ((gt.isCompleted || gt.status === 'completed') && !existingTopic.isCompleted) {
                    await db.topics.update(existingTopic.id!, { 
                        status: 'completed', 
                        isCompleted: true,
                        updatedAt: Date.now()
                    });
                }
            } else {
                // New topic from guest
                const { id, ...data } = gt;
                await db.topics.add({ ...data, subjectId: targetSubjectId, userId, updatedAt: Date.now() });
            }
        }

        // 3. LOGS & TIMETABLE (Append)
        const tables: any[] = [db.logs, db.timetable, db.settings, db.resources];
        for (const table of tables) {
            const guestItems = await table.where('userId').equals(guestId).toArray();
            for (const item of guestItems) {
                const { id, ...data } = item;
                let newData = { ...data, userId, updatedAt: Date.now() };
                
                if (table === db.logs && data.subjectId) {
                     // Remap subject ID logic
                    let mapped = guestToUserSubjectIdMap.get(data.subjectId);
                    if (!mapped) {
                         // Try fallback lookup
                         const guestSubject = guestSubjects.find(s => s.id === data.subjectId);
                         if (guestSubject) {
                             const key = `${guestSubject.parentId || 0}-${normalizeName(guestSubject.name)}`;
                             mapped = subjectMap.get(key);
                         }
                    }
                    if (mapped) newData.subjectId = mapped;
                    else continue; 
                }
                 // Avoid duplicating logs? For now append is safer than complex dedupe
                await table.add(newData);
            }
        }
    });

    // 4. MERGE STATS (Max Wins) - Update Zustand Stores
    try {
        const guestGamification = JSON.parse(localStorage.getItem('gamification-storage') || '{}')?.state;
        if (guestGamification) {
            const current = useGamificationStore.getState();
            // Max XP/Level wins
            if ((guestGamification.xp || 0) > current.xp) {
                useGamificationStore.setState({
                    xp: guestGamification.xp,
                    level: guestGamification.level,
                    unlockedBadges: [...new Set([...current.unlockedBadges, ...(guestGamification.unlockedBadges || [])])],
                    updatedAt: Date.now()
                });
            }
        }

        const guestTimer = JSON.parse(localStorage.getItem('timer-storage') || '{}')?.state;
        if (guestTimer) {
             const current = useTimerStore.getState();
             // Merge history? Or just keep max stats?
             // Let's keep session history from both if possible, or just append guest to current
             const mergedHistory = [...current.sessionHistory, ...(guestTimer.sessionHistory || [])];
             // Dedupe by timestamp if needed, but low risk
             useTimerStore.setState({
                 sessionHistory: mergedHistory,
                 todayStats: (guestTimer.todayStats?.totalFocusTime || 0) > current.todayStats.totalFocusTime ? guestTimer.todayStats : current.todayStats,
                 updatedAt: Date.now()
             });
        }
    } catch (err) {
        console.error('Error merging store stats:', err);
    }

    // 5. RELOAD ALL STORES TO INJECT MERGED DATA (Hot Reload)
    // This makes the UI update immediately without a refresh, and ensures backup() sees the new DB data
    console.log('🔄 Hot-reloading application state...');
    await Promise.all([
        useSubjectStore.getState().loadSubjects(),
        useSubjectStore.getState().loadAllTopics(),
        useLogStore.getState().loadAllLogs(),
        useTimetableStore.getState().loadTimetable()
    ]);

    // 6. Preserver Quiz Progress (LocalStorage)
    // Already handled by backup() call below which reads all localStorage
    
    console.log('🔄 Triggering cloud backup of merged data...');
    await this.backup(); // Pushes the merged state to cloud

    console.log('🤝 Guest data merged successfully.');
  },

  initAutoSync(intervalSeconds = 15) {
    if (this._autoSyncInterval) clearInterval(this._autoSyncInterval);
    
    console.log(`🔄 Sync service: Auto-sync started (Interval: ${intervalSeconds}s)`);
    this._autoSyncInterval = setInterval(async () => {
      const auth = useAuthStore.getState();
      if (!auth.isAuthenticated || this._isPaused) return;

      try {
          // 1. Check for remote changes (Polling every cycle)
          await this.checkAndRestore();

          // 2. Backup if we had local updates
          if (this._lastLocalUpdate && Date.now() - this._lastLocalUpdate < 20000) {
              // Only backup if we haven't backed up recently
              const lastSync = useSyncStore.getState().status.lastSyncTime || 0;
              if (Date.now() - lastSync > 30000) {
                  await this.backup();
              }
          }
      } catch (err) {
          console.error('Auto-sync cycle failed', err);
      }
    }, intervalSeconds * 1000);
  },

  async checkAndRestore() {
    if (this._isSyncing || this._isPaused) return;
    
    try {
        const response = await api.get('/sync/status');
        const remoteLastSynced = new Date(response.data.lastSynced).getTime();
        
        // If remote is newer than our last restore/backup, trigger restore
        if (remoteLastSynced > this._lastRestoreTime + 1000) { // 1s buffer
            console.log(`🔔 Remote changes detected (Remote: ${remoteLastSynced}, Local: ${this._lastRestoreTime}). Triggering restore...`);
            await this.restore();
        }
    } catch (err: any) {
        if (err.response?.status === 404) return; // No backup yet
        console.error('Failed to check sync status', err);
    }
  },

  // Public method to force a backup (e.g. after critical user action)
  triggerAutoBackup() {
      if (!this._isPaused && !this._isSyncing) {
          // Debounce slightly to avoid hammering and PROTECT against immediate restore overwrites
          if (this._lastLocalUpdate && Date.now() - this._lastLocalUpdate < 10000) return;
          
          this._lastLocalUpdate = Date.now();
          console.log('⚡ Triggering auto-backup...');
          this.backup();
      }
  }
};
