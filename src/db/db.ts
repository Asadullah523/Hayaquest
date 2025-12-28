import Dexie, { type Table } from 'dexie';
import type { Subject, Topic, StudyLog, TimetableSlot, Settings } from '../types';

export class HayaDB extends Dexie {
  subjects!: Table<Subject, number>;
  topics!: Table<Topic, number>;
  logs!: Table<StudyLog, number>;
  timetable!: Table<TimetableSlot, number>;
  settings!: Table<Settings, string>;
  resources!: Table<any, number>; // Using any for now to avoid circular dependency or separate type file need

  constructor() {
    super('HayaDB');
    this.version(3).stores({
      subjects: '++id, name, archived, parentId, userId',
      topics: '++id, subjectId, status, userId',
      logs: '++id, date, subjectId, timestamp, userId',
      timetable: '++id, dayOfWeek, userId',
      settings: 'key, userId',
      resources: '++id, title, category, type, dateAdded, userId' 
    });
  }
}

export const db = new HayaDB();
