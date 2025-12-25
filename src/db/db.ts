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
    this.version(2).stores({
      subjects: '++id, name, archived, parentId',
      topics: '++id, subjectId, status',
      logs: '++id, date, subjectId, timestamp',
      timetable: '++id, dayOfWeek',
      settings: 'key',
      resources: '++id, title, category, type, dateAdded' // Blob is stored in object but not indexed
    });
  }
}

export const db = new HayaDB();
