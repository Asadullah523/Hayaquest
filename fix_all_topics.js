// ONE-CLICK FIX: Run this in browser console on localhost:5173
// This will properly load ALL topics for both IMAT and MDCAT

(async function fixAllTopics() {
    console.log('🔧 Starting complete topic initialization...');

    const { db } = await import('./src/db/db.ts');

    // Step 1: Clear everything related to IMAT and MDCAT
    console.log('🗑️  Clearing old data...');

    const imatParent = await db.subjects.filter(s => s.name === 'IMAT Prep' && !s.parentId).first();
    const mdcatParent = await db.subjects.filter(s => s.name === 'MDCAT Prep' && !s.parentId).first();

    async function clearSubjectTree(parentId) {
        const children = await db.subjects.where('parentId').equals(parentId).toArray();
        for (const child of children) {
            // Delete grandchildren (chapters)
            const grandchildren = await db.subjects.where('parentId').equals(child.id).toArray();
            for (const gc of grandchildren) {
                await db.topics.where('subjectId').equals(gc.id).delete();
                await db.subjects.delete(gc.id);
            }
            // Delete child's topics and the child itself
            await db.topics.where('subjectId').equals(child.id).delete();
            await db.subjects.delete(child.id);
        }
    }

    if (imatParent) await clearSubjectTree(imatParent.id);
    if (mdcatParent) await clearSubjectTree(mdcatParent.id);

    // Step 2: Re-initialize everything
    console.log('🔄 Re-initializing...');
    const { initializePresetSubjects } = await import('./src/utils/initializePresetSubjects.ts');
    await initializePresetSubjects();

    // Step 3: Verify
    console.log('✅ Verifying...');
    const imatChildren = await db.subjects.where('parentId').equals(imatParent.id).toArray();
    const mdcatChildren = await db.subjects.where('parentId').equals(mdcatParent.id).toArray();

    console.log(`IMAT subjects: ${imatChildren.length}`);
    console.log(`MDCAT subjects: ${mdcatChildren.length}`);

    let totalTopics = 0;
    for (const child of [...imatChildren, ...mdcatChildren]) {
        const chapters = await db.subjects.where('parentId').equals(child.id).toArray();
        for (const chapter of chapters) {
            const topicCount = await db.topics.where('subjectId').equals(chapter.id).count();
            totalTopics += topicCount;
        }
    }

    console.log(`✅ Total topics loaded: ${totalTopics}`);
    console.log('🔄 Reloading page...');

    setTimeout(() => location.reload(), 1000);
})();
