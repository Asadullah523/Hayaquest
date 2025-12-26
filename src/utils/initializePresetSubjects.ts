import { db } from '../db/db';
import type { Subject } from '../types';
import { imatSyllabus } from '../data/syllabi/imat';
import { mdcatSyllabus } from '../data/syllabi/mdcat';
import { biologySyllabus } from '../data/biologySyllabus';
import { chemistrySyllabus } from '../data/chemistrySyllabus';
import { physicsSyllabus } from '../data/physicsSyllabus';

const IMAT_PARENT_NAME = 'IMAT Prep';
const MDCAT_PARENT_NAME = 'MDCAT Prep';
// Bump this version whenever you update the syllabus data to force a re-sync
const SYLLABUS_VERSION = 'v3.1'; 

let isInitializing = false;

export async function initializePresetSubjects(): Promise<void> {
  if (isInitializing) return;
  
  // OPTIMIZATION: Check if we've already synced this version
  const currentVersion = localStorage.getItem('syllabus_version');
  if (currentVersion === SYLLABUS_VERSION) {
    // Already synced, skip the heavy lifting
    console.log('⚡️ Syllabus up to date, skipping deep sync.');
    return;
  }

  isInitializing = true;

  try {
    console.log('🚀 DEEP SYNC: Implementing Hierarchical Prep Sections...');

    // 1. DEDUPLICATE ROOT PARENTS
    const imatParentId = await deduplicateParent(IMAT_PARENT_NAME, '🎓', '#818cf8');
    const mdcatParentId = await deduplicateParent(MDCAT_PARENT_NAME, '🩺', '#ec4899');
    
    // 2. ROOT SCIENCE BOOKS (Kept separate)
    const rootBiologyId = await deduplicateParent('Biology', '🧬', '#10b981');
    const rootChemistryId = await deduplicateParent('Chemistry', '🧪', '#3b82f6');
    const rootPhysicsId = await deduplicateParent('Physics', '⚛️', '#f59e0b');

    // Sync hierarchical roots
    await syncHierarchicalRoot(rootBiologyId, biologySyllabus);
    await syncHierarchicalRoot(rootChemistryId, chemistrySyllabus);
    await syncHierarchicalRoot(rootPhysicsId, physicsSyllabus);

    // 3. NUCLEAR WIPE OF IMAT/MDCAT CHILDREN (Hard Reset)
    // Only wipe if we are actually running the sync
    await wipeAllChildren(imatParentId);
    await wipeAllChildren(mdcatParentId);

    // 4. SEQUENTIAL RE-INITIALIZATION (Supports Chapters & Flat Topics)
    await processSyllabusAtomic(imatSyllabus, imatParentId);
    await processSyllabusAtomic(mdcatSyllabus, mdcatParentId);

    // 5. GLOBAL TOPIC CLEANUP
    await deduplicateAllTopics();
    
    // Success! Mark as initialized for this version
    localStorage.setItem('syllabus_version', SYLLABUS_VERSION);
    console.log('✅ SYNC COMPLETE: Hierarchical order restored.');
  } catch (error) {
    console.error('Initialization error:', error);
  } finally {
    isInitializing = false;
  }
}

async function wipeAllChildren(parentId: number) {
    const children = await db.subjects.where('parentId').equals(parentId).toArray();
    for (const child of children) {
        await deleteSubjectTree(child.id!);
    }
}

/**
 * Enhanced Atomic Re-initialization
 * Checks for .chapters or .topics to handle both structures
 */
async function processSyllabusAtomic(syllabus: any[], parentId: number) {
  for (const data of syllabus) {
    const subjectId = await db.subjects.add({
        name: data.name,
        color: data.color,
        icon: getSubjectIcon(data.name),
        priority: data.priority,
        targetHoursPerWeek: data.targetHoursPerWeek,
        createdAt: Date.now(),
        isPreset: true,
        parentId: parentId,
        archived: false
    } as Subject) as number;

    // A. Handle Hierarchical Chapters (New Structure)
    if (data.chapters && data.chapters.length > 0) {
      console.log(`📦 Creating hierarchical chapters for [${data.name}]`);
      for (const chapter of data.chapters) {
        const chapterId = await db.subjects.add({
          name: chapter.title,
          parentId: subjectId,
          color: '#3d2b1f', 
          icon: '📖',
          priority: 'medium',
          createdAt: Date.now(),
          isPreset: true,
          archived: false
        } as Subject) as number;

        if (chapter.topics && chapter.topics.length > 0) {
          const topicsToAdd = chapter.topics.map((t: string) => ({
              subjectId: chapterId,
              name: t,
              isCompleted: false,
              status: 'not-started' as const,
              learningProgress: 0,
              revisionCount: 0,
              masteryLevel: 0
          }));
          await db.topics.bulkAdd(topicsToAdd);
        }
      }
    } 
    // B. Handle Flat Topics (Fallback)
    else if (data.topics && data.topics.length > 0) {
      const topicsToAdd = data.topics.map((t: string) => ({
          subjectId: subjectId,
          name: t,
          isCompleted: false,
          status: 'not-started' as const,
          learningProgress: 0,
          revisionCount: 0,
          masteryLevel: 0
      }));
      await db.topics.bulkAdd(topicsToAdd);
    }
  }
}

async function syncHierarchicalRoot(parentId: number, syllabus: any[]) {
    const existing = await db.subjects.where('parentId').equals(parentId).toArray();
    for (const sub of existing) {
        const isValid = syllabus.some(c => c.title === sub.name);
        if (!isValid) await deleteSubjectTree(sub.id!);
    }

    for (const chapter of syllabus) {
        let chapterId: number;
        const existingChapter = await db.subjects.where('parentId').equals(parentId).and(s => s.name === chapter.title).first();
        
        if (!existingChapter) {
            chapterId = await db.subjects.add({
                name: chapter.title,
                parentId: parentId,
                color: '#3d2b1f', 
                icon: '📖',
                priority: 'medium',
                createdAt: Date.now(),
                isPreset: true,
                archived: false
            } as Subject) as number;
        } else {
            chapterId = existingChapter.id!;
            await db.subjects.update(chapterId, { archived: false });
        }

        await db.topics.where('subjectId').equals(chapterId).delete();
        if (chapter.topics && chapter.topics.length > 0) {
            const topicsToAdd = chapter.topics.map((t: string) => ({
                subjectId: chapterId,
                name: t,
                isCompleted: false,
                status: 'not-started' as const,
                learningProgress: 0,
                revisionCount: 0,
                masteryLevel: 0
            }));
            await db.topics.bulkAdd(topicsToAdd);
        }
    }
}

async function deleteSubjectTree(id: number) {
    const children = await db.subjects.where('parentId').equals(id).toArray();
    for (const child of children) {
        await deleteSubjectTree(child.id!);
    }
    await db.subjects.delete(id);
    await db.topics.where('subjectId').equals(id).delete();
    await db.logs.where('subjectId').equals(id).delete();
}

async function deduplicateParent(name: string, icon: string, color: string): Promise<number> {
    const parents = await db.subjects.where('name').equals(name).filter(s => !s.parentId).toArray();
    if (parents.length === 0) {
        return await db.subjects.add({
            name, color, icon, priority: 'high', createdAt: Date.now(), isPreset: true, archived: false
        } as Subject) as number;
    }
    const [master, ...redundant] = parents;
    const masterId = master.id!;
    if (redundant.length > 0) {
        for (const red of redundant) {
            await deleteSubjectTree(red.id!);
        }
    }
    await db.subjects.update(masterId, { icon, color, archived: false });
    return masterId;
}

async function deduplicateAllTopics() {
    const allTopics = await db.topics.toArray();
    const seen = new Set<string>();
    const dupIds: number[] = [];
    for (const t of allTopics) {
        const key = `${t.subjectId}-${t.name.trim().toLowerCase()}`;
        if (seen.has(key)) dupIds.push(t.id!);
        else seen.add(key);
    }
    if (dupIds.length > 0) await db.topics.bulkDelete(dupIds);
}

function getSubjectIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('biology')) return '🧬';
  if (lower.includes('chemistry')) return '🧪';
  if (lower.includes('physics')) return '⚛️';
  if (lower.includes('math')) return '📐';
  if (lower.includes('logical') || lower.includes('critical')) return '🧠';
  if (lower.includes('knowledge')) return '🌍';
  return '📗';
}
