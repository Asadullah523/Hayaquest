import { db } from '../db/db';
import { mathsSyllabus } from '../data/mathsSyllabus';

export const syncMathsSyllabus = async () => {
    // 1. Find or Create "IMAT Prep" Subject
    let imatPrep = await db.subjects.where('name').equals('IMAT Prep').first();
    if (!imatPrep) return;

    // 2. Find or Create "Mathematics" UNDER "IMAT Prep"
    // Note: Use 'Mathematics' or 'Maths' key
    let maths = await db.subjects
        .where({ parentId: imatPrep.id, name: 'Mathematics' })
        .first();

    if (!maths) {
        const mathId = await db.subjects.add({
            name: 'Mathematics',
            color: '#10b981', 
            icon: '📐',
            priority: 'high',
            targetHoursPerWeek: 5,
            createdAt: Date.now(),
            parentId: imatPrep.id,
            isPreset: true,
            archived: false
        });
        maths = await db.subjects.get(mathId);
    }

    if (!maths?.id) return;

    console.log(`Syncing Maths Syllabus for Subject ID: ${maths.id}`);

    // 3. Iterate through Chapters
    for (const chapter of mathsSyllabus) {
        // Check if chapter subject already exists
        let chapterSubject: typeof maths | undefined = await db.subjects
            .where({ parentId: maths.id, name: chapter.title })
            .first();

        let chapterId: number;

        if (!chapterSubject) {
            // Create Chapter as a Sub-Subject
            chapterId = await db.subjects.add({
                name: chapter.title,
                color: maths.color, // Inherit color
                icon: maths.icon,   // Inherit
                priority: maths.priority,
                targetHoursPerWeek: 0,
                createdAt: Date.now(),
                archived: false,
                parentId: maths.id,
                isPreset: true
            }) as number;
        } else {
            chapterId = chapterSubject.id!;
             // Ensure parentId is set correctly just in case
            if (chapterSubject.parentId !== maths.id) {
               await db.subjects.update(chapterId, { parentId: maths.id });
            }
        }

        // 4. Sync Topics for this Chapter
        const currentTopics = await db.topics.where('subjectId').equals(chapterId).toArray();
        const currentTopicNames = new Set(currentTopics.map(t => t.name));

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
    }
};
