import { db } from '../db/db';
import { chemistrySyllabus } from '../data/chemistrySyllabus';

export const syncChemistrySyllabus = async () => {
    // 1. Find or Create "Chemistry" at ROOT Level (No Parent)
    let chemistry = await db.subjects
        .filter(s => s.name === 'Chemistry' && !s.parentId)
        .first();

    if (!chemistry) {
         const chemId = await db.subjects.add({
            name: 'Chemistry',
            color: '#2563eb', // Standard Chemistry Blue
            icon: 'experiment', // Standard Icon
            priority: 'high',
            targetHoursPerWeek: 5,
            createdAt: Date.now(),
            // No parentId -> Root
            isPreset: true,
            archived: false
        });
        chemistry = await db.subjects.get(chemId);
    }

    if (!chemistry?.id) return;

    console.log(`Syncing Chemistry Syllabus for Subject ID: ${chemistry.id}`);

    // 3. Sync Chapters & STRICT CLEANUP
    const allDbChapters = await db.subjects.where('parentId').equals(chemistry.id).toArray();
    const validChapterTitles = new Set(chemistrySyllabus.map(c => c.title));

    // A. Remove DB Chapters that are NOT in the new Syllabus
    const chaptersToRemove = allDbChapters.filter(c => !validChapterTitles.has(c.name));
    if (chaptersToRemove.length > 0) {
        console.log(`Removing ${chaptersToRemove.length} extra chapters from Chemistry...`);
        const removeIds = chaptersToRemove.map(c => c.id!);
        await db.subjects.bulkDelete(removeIds);
        await db.topics.where('subjectId').anyOf(removeIds).delete();
    }

    // 2. Iterate through Chapters
    for (const chapter of chemistrySyllabus) {
        // Check if chapter subject already exists
        let chapterSubject = allDbChapters.find(c => c.name === chapter.title);
        
        if (!chapterSubject) {
             chapterSubject = await db.subjects
                .where({ parentId: chemistry.id, name: chapter.title })
                .first();
        }

        let chapterId: number;

        if (!chapterSubject) {
            // Create Chapter as a Sub-Subject
            chapterId = await db.subjects.add({
                name: chapter.title,
                color: chemistry.color, 
                icon: 'experiment',
                priority: chemistry.priority,
                targetHoursPerWeek: 0,
                createdAt: Date.now(),
                archived: false,
                parentId: chemistry.id,
                isPreset: true
            }) as number;
        } else {
            chapterId = chapterSubject.id!;
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
