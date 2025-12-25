// Quick fix script for MDCAT duplicates
// Open browser console at localhost:5173 and paste this

(async function fixMDCAT() {
    const { db } = await import('./src/db/db.ts');
    const { initializePresetSubjects } = await import('./src/utils/initializePresetSubjects.ts');

    console.log('🔧 Fixing MDCAT duplicates...');

    // Find MDCAT parent
    const mdcatParent = await db.subjects
        .filter(s => s.name === 'MDCAT Prep' && !s.parentId)
        .first();

    if (mdcatParent) {
        // Delete all children
        const children = await db.subjects.where('parentId').equals(mdcatParent.id).toArray();
        console.log(`Found ${children.length} MDCAT children, deleting...`);

        for (const child of children) {
            await db.topics.where('subjectId').equals(child.id).delete();
            await db.subjects.delete(child.id);
        }

        console.log('✅ Deleted all MDCAT children');
    }

    // Re-initialize
    console.log('🔄 Re-initializing preset subjects...');
    await initializePresetSubjects();

    console.log('✅ Done! Refresh the page.');
    window.location.reload();
})();
