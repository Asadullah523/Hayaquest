// COMPLETE DATABASE RE-INITIALIZATION
// Run this on localhost:5173 to completely fix topic loading

(async function completeReset() {
    console.log('🔧 Starting complete database reset...');

    const { db } = await import('./src/db/db.ts');

    // Step 1: Nuclear option - clear EVERYTHING related to subjects and topics
    console.log('🗑️  Clearing all subjects and topics...');
    await db.subjects.clear();
    await db.topics.clear();

    // Step 2: Re-initialize from scratch
    console.log('🔄 Re-initializing preset subjects...');
    const { initializePresetSubjects } = await import('./src/utils/initializePresetSubjects.ts');
    await initializePresetSubjects();

    // Step 3: Verify the data
    console.log('✅ Verifying initialization...');

    const allSubjects = await db.subjects.toArray();
    const allTopics = await db.topics.toArray();

    console.log(`📊 Total subjects: ${allSubjects.length}`);
    console.log(`📊 Total topics: ${allTopics.length}`);

    // Check IMAT
    const imatParent = await db.subjects.filter(s => s.name === 'IMAT Prep' && !s.parentId).first();
    if (imatParent) {
        const imatSubjects = await db.subjects.where('parentId').equals(imatParent.id).toArray();
        console.log(`\n📗 IMAT subjects: ${imatSubjects.length}`);

        for (const subject of imatSubjects) {
            const chapters = await db.subjects.where('parentId').equals(subject.id).toArray();
            console.log(`  - ${subject.name}: ${chapters.length} chapters`);

            for (const chapter of chapters) {
                const topics = await db.topics.where('subjectId').equals(chapter.id).toArray();
                console.log(`    - ${chapter.name}: ${topics.length} topics`);
            }
        }
    }

    // Check MDCAT
    const mdcatParent = await db.subjects.filter(s => s.name === 'MDCAT Prep' && !s.parentId).first();
    if (mdcatParent) {
        const mdcatSubjects = await db.subjects.where('parentId').equals(mdcatParent.id).toArray();
        console.log(`\n🩺 MDCAT subjects: ${mdcatSubjects.length}`);

        for (const subject of mdcatSubjects) {
            const topics = await db.topics.where('subjectId').equals(subject.id).toArray();
            console.log(`  - ${subject.name}: ${topics.length} topics`);
        }
    }

    console.log('\n✅ Database reset complete! Reloading in 2 seconds...');
    setTimeout(() => location.reload(), 2000);
})();
