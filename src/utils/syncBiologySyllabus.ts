import { db } from '../db/db';
import { biologySyllabus } from '../data/biologySyllabus';

export const syncBiologySyllabus = async () => {
    // 1. Find or Create "Biology" at ROOT Level (No Parent)
    let biology = await db.subjects
        .filter(s => s.name === 'Biology' && !s.parentId)
        .first();

    if (!biology) {
        const bioId = await db.subjects.add({
            name: 'Biology',
            color: '#10b981', 
            icon: 'dna',
            priority: 'high',
            targetHoursPerWeek: 5,
            createdAt: Date.now(),
            // No parentId -> Root
            isPreset: true,
            archived: false
        });
        biology = await db.subjects.get(bioId);
    }

    if (!biology?.id) return;

    console.log(`Syncing Biology Syllabus for Subject ID: ${biology.id}`);

    // CLEANUP: Remove any "IMAT Biology" chapters
    const imatChapters = await db.subjects
        .where('parentId')
        .equals(biology.id)
        .filter(s => s.name.startsWith('IMAT Biology'))
        .toArray();
    
    if (imatChapters.length > 0) {
        console.log(`Cleaning up ${imatChapters.length} IMAT chapters from Biology book...`);
        await db.subjects.bulkDelete(imatChapters.map(c => c.id!));
        const imatIds = imatChapters.map(c => c.id!);
        await db.topics.where('subjectId').anyOf(imatIds).delete();
    }

    // 3. Sync Chapters & STRICT CLEANUP
    const allDbChapters = await db.subjects.where('parentId').equals(biology.id).toArray();
    const validChapterTitles = new Set(biologySyllabus.map(c => c.title));

    // A. Remove DB Chapters that are NOT in the new Syllabus
    const chaptersToRemove = allDbChapters.filter(c => !validChapterTitles.has(c.name));
    if (chaptersToRemove.length > 0) {
        console.log(`Removing ${chaptersToRemove.length} extra chapters from Biology...`);
        const removeIds = chaptersToRemove.map(c => c.id!);
        await db.subjects.bulkDelete(removeIds);
        await db.topics.where('subjectId').anyOf(removeIds).delete();
    }

    // 2. Iterate through Chapters
    for (const chapter of biologySyllabus) {
        // Check if chapter subject already exists
        let chapterSubject = allDbChapters.find(c => c.name === chapter.title);
        
        if (!chapterSubject) {
             chapterSubject = await db.subjects
                .where({ parentId: biology.id, name: chapter.title })
                .first();
        }

        let chapterId: number;

        if (!chapterSubject) {
            // Create Chapter as a Sub-Subject
            chapterId = await db.subjects.add({
                name: chapter.title,
                color: biology.color, 
                icon: 'book-open',
                priority: biology.priority,
                targetHoursPerWeek: 0,
                createdAt: Date.now(),
                archived: false,
                parentId: biology.id,
                isPreset: true
            }) as number;
        } else {
            chapterId = chapterSubject.id!;
        }

        // 3. Sync Topics for this Chapter
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
