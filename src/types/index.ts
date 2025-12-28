export type Priority = 'high' | 'medium' | 'low';
export type TopicStatus = 'not-started' | 'in-progress' | 'completed';
export type StudyType = 'learning' | 'revision' | 'practice';

export interface Subject {
  id?: number; // Dexie uses number for auto-increment by default
  name: string;
  color: string;
  icon: string;
  priority: Priority;
  targetHoursPerWeek?: number;
  createdAt: number; // timestamp
  archived: boolean;
  
  // Revision Plan fields
  revisionPlanDuration?: number; // Total days/weeks/months for the plan
  revisionPlanType?: 'daily' | 'weekly' | 'monthly';
  completedDays?: number[]; // Array of day numbers that have been completed
  planStartDate?: number; // Timestamp when plan started
  isPreset?: boolean; // True for IMAT/MDCAT preset subjects
  parentId?: number; // NEW: To group subjects (e.g., Biology under IMAT)
  updatedAt?: number; // timestamp for sync conflict resolution
  userId?: string; // Partition for guest vs account data
  syncId?: string; // NEW: Global unique identifier
}

export interface Topic {
  id?: number;
  subjectId: number;
  name: string;
  isCompleted: boolean; 
  status: TopicStatus;
  learningProgress: number; // 0-100
  revisionCount: number;
  masteryLevel: number; // 0-100
  lastStudied?: number; // timestamp
  notes?: string;
  // Daily recurring task fields
  isRecurring?: boolean; // Whether this is a daily recurring task
  completionDates?: string[]; // Array of dates (YYYY-MM-DD) when task was completed
  lastCompletedDate?: string; // Last date marked complete (YYYY-MM-DD)
  completedAt?: number; // Timestamp when marked as completed (for streak calc)
  updatedAt?: number; // timestamp for sync conflict resolution
  userId?: string; // Partition for guest vs account data
  syncId?: string; // NEW: Global unique identifier
}

export interface StudyLog {
  id?: number;
  date: number; // timestamp
  subjectId: number;
  topicId?: number;
  durationSeconds: number;
  notes?: string;
  type: StudyType;
  timestamp: number;
  userId?: string; // Partition for guest vs account data
  updatedAt?: number; // timestamp for sync conflict resolution
  syncId?: string; // NEW: Global unique identifier
}

export interface TimetableSlot {
  id?: number;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday...
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  subjectId?: number;
  title?: string;
  color?: string;
  recurring: boolean;
  userId?: string; // Partition for guest vs account data
  updatedAt?: number; // timestamp for sync conflict resolution
  syncId?: string; // NEW: Global unique identifier
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: number; // timestamp
  restDaysThisWeek: number;
}

export interface Settings {
  key: string;
  value: any;
  userId?: string; // Partition for guest vs account data
  updatedAt?: number; // timestamp for sync conflict resolution
  syncId?: string; // NEW: Global unique identifier
}
