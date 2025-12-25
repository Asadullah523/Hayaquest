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

  initAutoSync(intervalMinutes = 5) {
    const interval = intervalMinutes * 60 * 1000;
    setInterval(async () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        console.log('Auto-sync: performing background backup...');
        try {
          await this.backup();
        } catch (err) {
          console.error('Auto-sync failed', err);
        }
      }
    }, interval);
  }
};
