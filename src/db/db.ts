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
    this.version(4).stores({
      subjects: '++id, name, archived, parentId, userId, syncId',
      topics: '++id, subjectId, status, userId, syncId',
      logs: '++id, date, subjectId, timestamp, userId, syncId',
      timetable: '++id, dayOfWeek, userId, syncId',
      settings: 'key, userId, syncId',
      resources: '++id, title, category, type, dateAdded, userId, syncId' 
    });
  }
}

export const db = new HayaDB();
