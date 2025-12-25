import { db } from './src/db/db';

async function list() {
  const subjects = await db.subjects.toArray();
  for (const s of subjects) {
    const parent = s.parentId ? (await db.subjects.get(s.parentId))?.name : 'Root';
    console.log(`ID: ${s.id} | Name: ${s.name} | Parent: ${parent} | Preset: ${s.isPreset}`);
  }
}
list();
