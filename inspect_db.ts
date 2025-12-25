import { db } from './src/db/db';

async function inspect() {
  const allSubjects = await db.subjects.toArray();
  const allTopics = await db.topics.toArray();

  console.log('--- Subjects ---');
  allSubjects.forEach(s => {
    console.log(`ID: ${s.id}, Name: ${s.name}, ParentID: ${s.parentId ?? 'None'}`);
  });

  console.log('\n--- Duplicate Check (Topics) ---');
  const topicCounts: Record<string, number> = {};
  allTopics.forEach(t => {
    const key = `${t.subjectId}-${t.name}`;
    topicCounts[key] = (topicCounts[key] || 0) + 1;
  });

  Object.entries(topicCounts).forEach(([key, count]) => {
    if (count > 1) {
      console.log(`DUPLICATE: Topic [${key}] appears ${count} times`);
    }
  });

  console.log('\n--- Parent Count ---');
  const imatParents = allSubjects.filter(s => s.name === 'IMAT Prep' && !s.parentId);
  const mdcatParents = allSubjects.filter(s => s.name === 'MDCAT Prep' && !s.parentId);
  console.log(`IMAT Prep parents: ${imatParents.length}`);
  console.log(`MDCAT Prep parents: ${mdcatParents.length}`);
}

inspect();
