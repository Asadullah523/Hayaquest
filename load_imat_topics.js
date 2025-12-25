// Run this in browser console at localhost:5173/imat
// This will load all the IMAT topics into the IMAT Prep Tracker section

(async function loadImatTopics() {
    console.log('🔄 Loading IMAT topics...');

    const { db } = await import('./src/db/db.ts');
    const { initializePresetSubjects } = await import('./src/utils/initializePresetSubjects.ts');

    // Find IMAT Prep parent
    const imatParent = await db.subjects
        .filter(s => s.name === 'IMAT Prep' && !s.parentId)
        .first();

    if (imatParent) {
        console.log('✅ Found IMAT Prep parent');

        // Delete all children and their topics
        const children = await db.subjects.where('parentId').equals(imatParent.id).toArray();
        console.log(`🗑️  Deleting ${children.length} old subjects...`);

        for (const child of children) {
            // Delete child's children (chapters) and their topics
            const grandchildren = await db.subjects.where('parentId').equals(child.id).toArray();
            for (const gc of grandchildren) {
                await db.topics.where('subjectId').equals(gc.id).delete();
                await db.subjects.delete(gc.id);
            }

            // Delete child's topics
            await db.topics.where('subjectId').equals(child.id).delete();
            await db.subjects.delete(child.id);
        }
    }

    // Re-initialize everything
    console.log('🔄 Re-initializing preset subjects...');
    await initializePresetSubjects();

    console.log('✅ Done! Reloading page...');
    setTimeout(() => location.reload(), 1000);
})();
