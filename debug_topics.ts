import { db } from './src/db/db';

async function debug() {
    const physics = await db.subjects.where('name').equals('Physics').and(s => !s.parentId).first();
    if (!physics) {
        console.log('Physics root not found');
        return;
    }
    console.log('Physics ID:', physics.id);

    const chapters = await db.subjects.where('parentId').equals(physics.id!).toArray();
    console.log('Chapters found:', chapters.length);

    for (const chapter of chapters) {
        const topics = await db.topics.where('subjectId').equals(chapter.id!).toArray();
        console.log(`Chapter [${chapter.name}] (ID: ${chapter.id}): ${topics.length} topics`);
        if (topics.length === 0) {
            console.log('  -> ERROR: NO TOPICS FOUND!');
        }
    }
}

debug();
