// DEBUG SCRIPT - Run this first to see what's actually in the database
// Paste in console at localhost:5173

(async function debugDatabase() {
    const { db } = await import('./src/db/db.ts');

    console.log('🔍 DATABASE INSPECTION\n');

    // Get all subjects and topics
    const allSubjects = await db.subjects.toArray();
    const allTopics = await db.topics.toArray();

    console.log(`📊 Total subjects in DB: ${allSubjects.length}`);
    console.log(`📊 Total topics in DB: ${allTopics.length}\n`);

    // Find IMAT
    const imatParent = allSubjects.find(s => s.name === 'IMAT Prep' && !s.parentId);

    if (imatParent) {
        console.log(`\n📗 IMAT PREP (ID: ${imatParent.id})`);
        const imatChildren = allSubjects.filter(s => s.parentId === imatParent.id);
        console.log(`   Direct children: ${imatChildren.length}`);

        for (const child of imatChildren) {
            console.log(`\n   📘 ${child.name} (ID: ${child.id})`);

            // Topics directly on this subject
            const directTopics = allTopics.filter(t => t.subjectId === child.id);
            console.log(`      Direct topics: ${directTopics.length}`);

            // Chapters (grandchildren)
            const chapters = allSubjects.filter(s => s.parentId === child.id);
            console.log(`      Chapters: ${chapters.length}`);

            for (const chapter of chapters) {
                const chapterTopics = allTopics.filter(t => t.subjectId === chapter.id);
                console.log(`         📖 ${chapter.name} (ID: ${chapter.id})`);
                console.log(`            Topics: ${chapterTopics.length}`);
                if (chapterTopics.length > 0) {
                    console.log(`            Sample topics:`, chapterTopics.slice(0, 3).map(t => t.name));
                }
            }
        }
    }

    console.log('\n\n📋 SAMPLE TOPICS:');
    console.log(allTopics.slice(0, 10).map(t => ({
        id: t.id,
        name: t.name,
        subjectId: t.subjectId
    })));

    console.log('\n✅ Debug complete. Check the output above.');
})();
