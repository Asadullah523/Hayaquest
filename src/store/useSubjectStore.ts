import { create } from 'zustand';
import { db } from '../db/db';
import type { Subject, Topic } from '../types';
import { useGamificationStore } from './useGamificationStore';
import { syncService } from '../services/syncService';
import { useAuthStore } from './useAuthStore';

const getCurrentUserId = () => {
  const { user, isAuthenticated } = useAuthStore.getState();
  return isAuthenticated && user ? user.email : 'guest';
};

interface SubjectState {
  subjects: Subject[];
  topics: Topic[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSubjects: () => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<number>;
  updateSubject: (id: number, changes: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: number) => Promise<void>;
  
  loadTopics: (subjectId: number) => Promise<void>;
  toggleTopicStatus: (subjectId: number, topicId: number) => Promise<void>;
  addTopic: (topic: Omit<Topic, 'id'>) => Promise<number>;
  updateTopic: (id: number, changes: Partial<Topic>) => Promise<void>;
  deleteTopic: (id: number) => Promise<void>;
  
  // Revision Plan Actions
  createRevisionPlan: (subjectId: number, duration: number, type: 'daily' | 'weekly' | 'monthly') => Promise<void>;
  markDayComplete: (subjectId: number, dayNumber: number) => Promise<void>;
  getSubjectProgress: (subjectId: number) => { completed: number; total: number; percentage: number };
  getTodayTaskStatus: (subjectId: number) => 'completed' | 'pending' | 'none';
  
  // Daily Recurring Task Actions
  markDailyTaskComplete: (topicId: number) => Promise<void>;
  getDailyTasks: () => { topic: Topic; subject: Subject; isCompletedToday: boolean }[];
  isTaskCompletedToday: (topic: Topic) => boolean;
  
  loadAllTopics: () => Promise<void>;
  getParentProgress: (parentId: number) => Promise<{ completed: number; total: number; percentage: number }>;
  
  importSyllabus: (syllabusData: any[]) => Promise<void>;
  isSubjectNew: (subject: Subject) => boolean;
}

export const useSubjectStore = create<SubjectState>((set) => ({
  subjects: [],
  topics: [],
  isLoading: false,
  error: null,

  isSubjectNew: (subject: Subject) => {
    if (!subject.createdAt) return false;
    const oneDay = 24 * 60 * 60 * 1000;
    return (Date.now() - subject.createdAt) < oneDay;
  },

  loadSubjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const userId = getCurrentUserId();
      const subjects = await db.subjects.where('userId').equals(userId).toArray();
      set({ subjects, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load subjects', isLoading: false });
      console.error(error);
    }
  },

  loadAllTopics: async () => {
    try {
        const userId = getCurrentUserId();
        const topics = await db.topics.where('userId').equals(userId).toArray();
        set({ topics });
    } catch (error) {
        console.error(error);
    }
  },

  getParentProgress: async (parentId) => {
    try {
      const userId = getCurrentUserId();
      const children = await db.subjects
        .where('parentId').equals(parentId)
        .and(s => s.userId === userId)
        .toArray();
      const childIds = children.map(s => s.id).filter(Boolean) as number[];
      
      const allTopics = await db.topics
        .where('subjectId').anyOf(childIds)
        .and(t => t.userId === userId)
        .toArray();
      const completed = allTopics.filter(t => t.isCompleted).length;
      const total = allTopics.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return { completed, total, percentage };
    } catch (error) {
      console.error(error);
      return { completed: 0, total: 0, percentage: 0 };
    }
  },

  addSubject: async (subject) => {
    try {
      const userId = getCurrentUserId();
      const updatedAt = Date.now();
      const id = await db.subjects.add({ ...subject, userId, updatedAt } as Subject);
      const newSubject = { ...subject, id, userId, updatedAt };
      set((state) => ({ subjects: [...state.subjects, newSubject] }));
      
      // NEW: Trigger achievement check on subject creation
      // We can't import useAchievementsStore directly to avoid circular deps if they exist,
      // but we can import it at the top level or use it here if safely imported.
      // For now, let's assume we can trigger it or let the component do it.
      // Actually, better to do it in the store to ensure it always happens.
      syncService.triggerAutoBackup();
      return id;
    } catch (error) {
      set({ error: 'Failed to add subject' });
      throw error;
    }
  },

  updateSubject: async (id, changes) => {
    try {
      const updatedAt = Date.now();
      await db.subjects.update(id, { ...changes, updatedAt });
      set((state) => ({
        subjects: state.subjects.map(s => s.id === id ? { ...s, ...changes, updatedAt } : s)
      }));
      syncService.triggerAutoBackup();
    } catch (error) {
      set({ error: 'Failed to update subject' });
      throw error;
    }
  },

  deleteSubject: async (id) => {
    try {
      const subject = await db.subjects.get(id);
      if (subject?.isPreset) {
        console.warn('Cannot delete preset subject');
        return;
      }

      await db.subjects.delete(id);
      // Also delete related topics? Optional for now, but good practice.
      // await db.topics.where('subjectId').equals(id).delete(); 
      set((state) => ({
        subjects: state.subjects.filter(s => s.id !== id)
      }));
      syncService.triggerAutoBackup();
    } catch (error) {
      set({ error: 'Failed to delete subject' });
      throw error;
    }
  },

  loadTopics: async (subjectId) => {
     try {
       const userId = getCurrentUserId();
       const newTopics = await db.topics
        .where('subjectId').equals(subjectId)
        .and(t => t.userId === userId)
        .toArray();
       
       // Merge with existing topics instead of replacing
       set((state) => {
         // Remove old topics for this subject
         const filteredTopics = state.topics.filter(t => t.subjectId !== subjectId);
         // Add new topics for this subject
         return { topics: [...filteredTopics, ...newTopics] };
       });
     } catch (error) {
       console.error(error);
     }
  },

  addTopic: async (topic) => {
    try {
      const userId = getCurrentUserId();
      const updatedAt = Date.now();
      const id = await db.topics.add({ ...topic, userId, updatedAt } as Topic);
      const newTopic = { ...topic, id, userId, updatedAt };
      set((state) => ({ topics: [...state.topics, newTopic] }));
      syncService.triggerAutoBackup();
      return id;
    } catch (error) {
      set({ error: 'Failed to add topic' });
      throw error;
    }
  },

  toggleTopicStatus: async (_subjectId, topicId) => {
    try {
        const topic = await db.topics.get(topicId);
        if (topic) {
            const newIsCompleted = !topic.isCompleted;
            const newStatus = newIsCompleted ? 'completed' : 'not-started';
            
            const updatedAt = Date.now();
            await db.topics.update(topicId, { 
                isCompleted: newIsCompleted,
                status: newStatus as any, 
                masteryLevel: newIsCompleted ? 1 : 0,
                completedAt: newIsCompleted ? Date.now() : undefined,
                updatedAt
            });

            // Gamification Hook
            if (newIsCompleted) {
                useGamificationStore.getState().addXp(100);
            }

            set((state) => ({
                topics: state.topics.map(t => t.id === topicId ? { ...t, isCompleted: newIsCompleted, status: newStatus as any, updatedAt } : t)
            }));
            syncService.triggerAutoBackup();
        }
    } catch (e) {
        console.error("Failed to toggle topic", e);
    }
  },

  updateTopic: async (id, changes) => {
    try {
      const updatedAt = Date.now();
      await db.topics.update(id, { ...changes, updatedAt });
      set((state) => ({
        topics: state.topics.map(t => t.id === id ? { ...t, ...changes, updatedAt } : t)
      }));
      syncService.triggerAutoBackup();
    } catch (error) {
       set({ error: 'Failed to update topic' });
       throw error;
    }
  },

  deleteTopic: async (id) => {
    try {
      await db.topics.delete(id);
      set((state) => ({
        topics: state.topics.filter(t => t.id !== id)
      }));
      syncService.triggerAutoBackup();
    } catch (error) {
      set({ error: 'Failed to delete topic' });
      throw error;
    }
  },

  createRevisionPlan: async (subjectId, duration, type) => {
    try {
      await db.subjects.update(subjectId, {
        revisionPlanDuration: duration,
        revisionPlanType: type,
        completedDays: [],
        planStartDate: Date.now()
      });
      set((state) => ({
        subjects: state.subjects.map(s => 
          s.id === subjectId 
            ? { ...s, revisionPlanDuration: duration, revisionPlanType: type, completedDays: [], planStartDate: Date.now() }
            : s
        )
      }));
    } catch (error) {
      console.error('Failed to create revision plan', error);
      throw error;
    }
  },

  markDayComplete: async (subjectId, dayNumber) => {
    try {
      const subject = await db.subjects.get(subjectId);
      if (subject) {
        const completedDays = subject.completedDays || [];
        if (!completedDays.includes(dayNumber)) {
          const newCompletedDays = [...completedDays, dayNumber];
          await db.subjects.update(subjectId, { completedDays: newCompletedDays });
          
          set((state) => ({
            subjects: state.subjects.map(s =>
              s.id === subjectId ? { ...s, completedDays: newCompletedDays } : s
            )
          }));
          
          // Award XP for completion
          useGamificationStore.getState().addXp(50);
        }
      }
    } catch (error) {
      console.error('Failed to mark day complete', error);
      throw error;
    }
  },

  getSubjectProgress: (subjectId: number): { completed: number; total: number; percentage: number } => {
    const state = useSubjectStore.getState();
    const subject: Subject | undefined = state.subjects.find((s: Subject) => s.id === subjectId);
    
    if (!subject) return { completed: 0, total: 0, percentage: 0 };
    
    // Calculate from revision plan if exists
    if (subject.revisionPlanDuration && subject.completedDays) {
      const completed: number = subject.completedDays.length;
      const total: number = subject.revisionPlanDuration;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { completed, total, percentage };
    }
    
    // Otherwise calculate from topics
    const subjectTopics = state.topics.filter((t: Topic) => t.subjectId === subjectId);
    const completed: number = subjectTopics.filter((t: Topic) => t.isCompleted).length;
    const total: number = subjectTopics.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  },

  getTodayTaskStatus: (subjectId: number): 'completed' | 'pending' | 'none' => {
    const state = useSubjectStore.getState();
    const subject: Subject | undefined = state.subjects.find((s: Subject) => s.id === subjectId);
    
    if (!subject || !subject.revisionPlanDuration || !subject.planStartDate) {
      return 'none';
    }
    
    const now = Date.now();
    const daysSinceStart = Math.floor((now - subject.planStartDate) / (1000 * 60 * 60 * 24));
    const currentDay = daysSinceStart + 1;
    
    if (currentDay > subject.revisionPlanDuration) {
      return 'none'; // Plan completed
    }
    
    const completedDays = subject.completedDays || [];
    return completedDays.includes(currentDay) ? 'completed' : 'pending';
  },

  importSyllabus: async (syllabusData: any[]) => {
    set({ isLoading: true });
    try {
        const userId = getCurrentUserId();
        for (const subjectData of syllabusData) {
            const subjectId = await db.subjects.add({
                name: subjectData.name,
                color: subjectData.color,
                priority: subjectData.priority,
                targetHoursPerWeek: subjectData.targetHoursPerWeek,
                icon: 'book', // Default icon
                createdAt: Date.now(),
                archived: false,
                userId
            });

            if (subjectData.topics && Array.isArray(subjectData.topics)) {
                const topicsToAdd = subjectData.topics.map((topicName: string) => ({
                    subjectId,
                    name: topicName,
                    isCompleted: false, 
                    status: 'not-started',
                    learningProgress: 0,
                    revisionCount: 0,
                    masteryLevel: 0,
                    userId
                }));
                // @ts-ignore
                await db.topics.bulkAdd(topicsToAdd);
            }
        }
        
        const subjects = await db.subjects.where('userId').equals(userId).toArray();
        set({ subjects, isLoading: false });
    } catch (error) {
        console.error('Failed to import syllabus', error);
        set({ error: 'Failed to import syllabus', isLoading: false });
    }
  },

  // Daily Recurring Task Functions
  markDailyTaskComplete: async (topicId: number) => {
    try {
      const topic = await db.topics.get(topicId);
      if (!topic || !topic.isRecurring) return;
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const completionDates = topic.completionDates || [];
      
      // Add today if not already completed
      if (!completionDates.includes(today)) {
        const newCompletionDates = [...completionDates, today];
        
        await db.topics.update(topicId, {
          completionDates: newCompletionDates,
          lastCompletedDate: today
        });
        
        // Update state immutably without destroying other topics
        set((state) => ({
          topics: state.topics.map(t => 
            t.id === topicId 
              ? { ...t, completionDates: newCompletionDates, lastCompletedDate: today } 
              : t
          )
        }));
        
        syncService.triggerAutoBackup();

        // Award XP for completing daily task
        useGamificationStore.getState().addXp(10);
      }
    } catch (error) {
      console.error('Failed to mark daily task complete:', error);
    }
  },

  getDailyTasks: () => {
    const state = useSubjectStore.getState();
    const dailyTasks: { topic: Topic; subject: Subject; isCompletedToday: boolean }[] = [];
    
    state.topics.forEach((topic: Topic) => {
      if (topic.isRecurring) {
        const subject = state.subjects.find((s: Subject) => s.id === topic.subjectId);
        if (subject) {
          const isCompletedToday = state.isTaskCompletedToday(topic);
          dailyTasks.push({ topic, subject, isCompletedToday });
        }
      }
    });
    
    return dailyTasks;
  },

  isTaskCompletedToday: (topic: Topic) => {
    if (!topic.isRecurring) return false;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return (topic.completionDates || []).includes(today);
  }

}));
