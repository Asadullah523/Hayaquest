import { db } from './src/db/db';

async function verify() {
  const imatParent = await db.subjects.where('name').equals('IMAT Prep').first();
  const mdcatParent = await db.subjects.where('name').equals('MDCAT Prep').first();

  console.log('--- IMAT Prep ---');
  if (imatParent) {
    const children = await db.subjects.where('parentId').equals(imatParent.id!).toArray();
    for (const child of children) {
      const chapters = await db.subjects.where('parentId').equals(child.id!).toArray();
      const directTopics = await db.topics.where('subjectId').equals(child.id!).toArray();
      console.log(`Subject: ${child.name} (${chapters.length} chapters, ${directTopics.length} direct topics)`);
      for (const cap of chapters) {
          const capTopics = await db.topics.where('subjectId').equals(cap.id!).toArray();
          console.log(`  - Chapter: ${cap.name} (${capTopics.length} topics)`);
      }
    }
  } else {
    console.log('IMAT Prep not found');
  }

  console.log('\n--- MDCAT Prep ---');
  if (mdcatParent) {
    const children = await db.subjects.where('parentId').equals(mdcatParent.id!).toArray();
    for (const child of children) {
      const chapters = await db.subjects.where('parentId').equals(child.id!).toArray();
      const directTopics = await db.topics.where('subjectId').equals(child.id!).toArray();
      console.log(`Subject: ${child.name} (${chapters.length} chapters, ${directTopics.length} direct topics)`);
    }
  } else {
    console.log('MDCAT Prep not found');
  }
}

verify();
