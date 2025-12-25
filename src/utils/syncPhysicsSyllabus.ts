import { db } from '../db/db';
import { physicsSyllabus } from '../data/physicsSyllabus';

export const syncPhysicsSyllabus = async () => {
    // 1. Find or Create "Physics" at ROOT Level (No Parent)
    // Filter handles check for undefined/null parentId
    let physics = await db.subjects
        .filter(s => s.name === 'Physics' && !s.parentId)
        .first();

    if (!physics) {
        const physId = await db.subjects.add({
            name: 'Physics',
            color: '#7c3aed', // Using Purple/Violet for Physics (Standard) or keep previous
            icon: 'zap',      // Standard Physics Icon
            priority: 'high',
            targetHoursPerWeek: 5,
            createdAt: Date.now(),
            // No parentId -> Root Level
            isPreset: true,
            archived: false
        });
        physics = await db.subjects.get(physId);
    }

    if (!physics?.id) return;

    console.log(`Syncing Physics Syllabus for Subject ID: ${physics.id}`);

    // CLEANUP: Remove any "IMAT Physics" chapters from this root Physics subject
    // distinct from the user's request to separate them
    const imatChapters = await db.subjects
        .where('parentId')
        .equals(physics.id)
        .filter(s => s.name.startsWith('IMAT Physics'))
        .toArray();
    
    if (imatChapters.length > 0) {
        console.log(`Cleaning up ${imatChapters.length} IMAT chapters from Physics book...`);
        await db.subjects.bulkDelete(imatChapters.map(c => c.id!));
        // We could also delete topics here, but it's okay, they will be orphaned or we can clean
        const imatIds = imatChapters.map(c => c.id!);
        await db.topics.where('subjectId').anyOf(imatIds).delete();
    }

    // 3. Sync Chapters (Add New / Keep Existing) & STRICT CLEANUP of Old Chapters
    const allDbChapters = await db.subjects.where('parentId').equals(physics.id).toArray();
    const validChapterTitles = new Set(physicsSyllabus.map(c => c.title));

    // A. Remove DB Chapters that are NOT in the new Syllabus
    const chaptersToRemove = allDbChapters.filter(c => !validChapterTitles.has(c.name));
    if (chaptersToRemove.length > 0) {
        console.log(`Removing ${chaptersToRemove.length} extra chapters from Physics...`);
        const removeIds = chaptersToRemove.map(c => c.id!);
        await db.subjects.bulkDelete(removeIds);
        // Also delete their topics
        await db.topics.where('subjectId').anyOf(removeIds).delete();
    }

    // B. Iterate through Valid Chapters
    for (const chapter of physicsSyllabus) {
        // Check if chapter subject already exists
        let chapterSubject = allDbChapters.find(c => c.name === chapter.title); // Use precached list (careful, we might have deleted it? No, we filtered `chaptersToRemove`)
        // Actually safe to query or use find. Since we deleted the invalid ones, the remaining ones matching names are valid.
        
        // Re-query or filter from existing list to be safe? 
        // simpler: just use current `db` query as before, or optimized.
        // Let's stick to the loop structure but ensure we find it.
        
        if (!chapterSubject) {
             chapterSubject = await db.subjects
                .where({ parentId: physics.id, name: chapter.title })
                .first();
        }

        let chapterId: number;

        if (!chapterSubject) {
            // Create Chapter as a Sub-Subject
            chapterId = await db.subjects.add({
                name: chapter.title,
                color: physics.color, 
                icon: physics.icon,   
                priority: physics.priority,
                targetHoursPerWeek: 0,
                createdAt: Date.now(),
                archived: false,
                parentId: physics.id,
                isPreset: true
            }) as number;
        } else {
             chapterId = chapterSubject.id!;
             // Ensure parentId is set correctly
            if (chapterSubject.parentId !== physics.id) {
               await db.subjects.update(chapterId, { parentId: physics.id });
            }
        }

        // 4. Sync Topics for this Chapter
        const currentTopics = await db.topics.where('subjectId').equals(chapterId).toArray();
        const currentTopicNames = new Set(currentTopics.map(t => t.name));
        const newTopicNames = new Set(chapter.topics);

        // A. Add New Topics
        const topicsToAdd = chapter.topics
            .filter(t => !currentTopicNames.has(t))
            .map(t => ({
                subjectId: chapterId,
                name: t,
                isCompleted: false,
                status: 'not-started' as const,
                learningProgress: 0,
                revisionCount: 0,
                masteryLevel: 0
            }));

        if (topicsToAdd.length > 0) {
            await db.topics.bulkAdd(topicsToAdd);
            console.log(`Added ${topicsToAdd.length} topics to ${chapter.title}`);
        }

        // B. Remove Orphan Topics (Strict Sync)
        const topicsToRemove = currentTopics
            .filter(t => !newTopicNames.has(t.name))
            .map(t => t.id!);

        if (topicsToRemove.length > 0) {
            await db.topics.bulkDelete(topicsToRemove);
            console.log(`Removed ${topicsToRemove.length} extra topics from ${chapter.title}`);
        }
    }
};
