import { db } from '../db/db';
import type { Subject } from '../types';
import { imatSyllabus } from '../data/syllabi/imat';
import { mdcatSyllabus } from '../data/syllabi/mdcat';
import { biologySyllabus } from '../data/biologySyllabus';
import { chemistrySyllabus } from '../data/chemistrySyllabus';
import { physicsSyllabus } from '../data/physicsSyllabus';

import { normalizeName } from '../utils/stringUtils';
import { useAuthStore } from '../store/useAuthStore';

import { generateDeterministicSyncId } from './syncUtils';

const IMAT_PARENT_NAME = 'IMAT Prep';
const MDCAT_PARENT_NAME = 'MDCAT Prep';
const SYLLABUS_VERSION = 'v3.3'; // Forced increment for global syncId alignment

let isInitializing = false;

const getCurrentUserId = () => {
  const { user, isAuthenticated } = useAuthStore.getState();
  return isAuthenticated && user ? user.email : 'guest';
};

export async function initializePresetSubjects(): Promise<void> {
  if (isInitializing) return;
  isInitializing = true;
  
  const userId = getCurrentUserId();
  const versionKey = `syllabus_version_${userId}`;
  
  // 0. NUCLEAR DEDUPLICATION (Case-Insensitive Cleanup)
  // Must run BEFORE early exit to fix existing corrupted states
  await nuclearCleanup(userId);

  // OPTIMIZATION: Check if we've already synced this version for THIS user
  const currentVersion = localStorage.getItem(versionKey);
  
  // Also check if critical data exists for THIS user
  const imatParent = await db.subjects
    .where('userId').equals(userId)
    .and(s => s.name === IMAT_PARENT_NAME && !s.parentId)
    .first();
  
  const imatChildren = imatParent ? await db.subjects.where('parentId').equals(imatParent.id!).toArray() : [];
  const needsReinit = !imatParent || imatChildren.length === 0;

  if (currentVersion === SYLLABUS_VERSION && !needsReinit) {
    console.log(`⚡️ Syllabus for [${userId}] up to date.`);
    return;
  }

  try {
    console.log('🚀 DEEP SYNC: Implementing Hierarchical Prep Sections...');

    // 1. DEDUPLICATE ROOT PARENTS
    const imatParentId = await deduplicateParent(IMAT_PARENT_NAME, '🎓', '#818cf8', userId, 'imat');
    const mdcatParentId = await deduplicateParent(MDCAT_PARENT_NAME, '🩺', '#ec4899', userId, 'mdcat');
    
    // 2. ROOT SCIENCE BOOKS (Kept separate)
    const rootBiologyId = await deduplicateParent('Biology', '🧬', '#10b981', userId, 'biology');
    const rootChemistryId = await deduplicateParent('Chemistry', '🧪', '#3b82f6', userId, 'chemistry');
    const rootPhysicsId = await deduplicateParent('Physics', '⚛️', '#f59e0b', userId, 'physics');

    // Sync hierarchical roots
    await syncHierarchicalRoot(rootBiologyId, biologySyllabus, userId, 'biology');
    await syncHierarchicalRoot(rootChemistryId, chemistrySyllabus, userId, 'chemistry');
    await syncHierarchicalRoot(rootPhysicsId, physicsSyllabus, userId, 'physics');

    // 3. NUCLEAR WIPE REMOVED
    // We no longer wipe children because it deletes local progress.
    // Instead, processSyllabusAtomic will now update or add missing items.

    // 4. SEQUENTIAL RE-INITIALIZATION (Supports Chapters & Flat Topics)
    await processSyllabusAtomic(imatSyllabus, imatParentId, userId, 'imat');
    await processSyllabusAtomic(mdcatSyllabus, mdcatParentId, userId, 'mdcat');

    // 5. GLOBAL TOPIC CLEANUP
    await deduplicateAllTopics(userId);
    
    // 6. PROTECT DATA: Set a local change timestamp to prevent immediate auto-sync overwrite
    const { syncService } = await import('../services/syncService');
    syncService.triggerAutoBackup();

    // Success! Mark as initialized for this version
    localStorage.setItem(versionKey, SYLLABUS_VERSION);
    console.log('✅ SYNC COMPLETE: Hierarchical order restored.');
  } catch (error) {
    console.error('Initialization error:', error);
  } finally {
    isInitializing = false;
  }
}

// wipeAllChildren removed to protect localized data

async function processSyllabusAtomic(syllabus: any[], parentId: number, userId: string, pathPrefix: string) {
  for (const data of syllabus) {
    const currentPath = `${pathPrefix}:${data.name.toLowerCase().replace(/ /g, '_')}`;
    const syncId = generateDeterministicSyncId('subject', currentPath);

    // 1. DEDUPLICATE SUBJECT
    let subjectId: number;
    const allSubjects = await db.subjects.where('userId').equals(userId).toArray();
    
    // First try by syncId, then by name for legacy
    let existingSubject = allSubjects.find(s => s.syncId === syncId);
    if (!existingSubject) {
        existingSubject = allSubjects.find(s => 
            s.parentId === parentId && 
            normalizeName(s.name) === normalizeName(data.name)
        );
    }
    
    if (existingSubject) {
      subjectId = existingSubject.id!;
      await db.subjects.update(subjectId, {
        name: data.name, 
        color: data.color,
        icon: getSubjectIcon(data.name),
        priority: data.priority,
        targetHoursPerWeek: data.targetHoursPerWeek,
        archived: false,
        syncId,
        updatedAt: 1
      });
    } else {
      subjectId = await db.subjects.add({
        name: data.name,
        color: data.color,
        icon: getSubjectIcon(data.name),
        priority: data.priority,
        targetHoursPerWeek: data.targetHoursPerWeek,
        createdAt: Date.now(),
        updatedAt: 1,
        isPreset: true,
        parentId: parentId,
        archived: false,
        userId,
        syncId
      } as Subject) as number;
    }

    // A. Handle Hierarchical Chapters
    if (data.chapters && data.chapters.length > 0) {
      for (const chapter of data.chapters) {
        const chapterPath = `${currentPath}:${chapter.title.toLowerCase().replace(/ /g, '_')}`;
        const chapterSyncId = generateDeterministicSyncId('subject', chapterPath);
        
        let chapterId: number;
        const subSubjects = await db.subjects.where('parentId').equals(subjectId).toArray();
        let existingChapter = subSubjects.find(s => s.syncId === chapterSyncId);
        if (!existingChapter) {
            existingChapter = subSubjects.find(s => normalizeName(s.name) === normalizeName(chapter.title));
        }
        
        if (existingChapter) {
          chapterId = existingChapter.id!;
          await db.subjects.update(chapterId, { 
            name: chapter.title,
            archived: false,
            syncId: chapterSyncId,
            updatedAt: 1
          });
        } else {
          chapterId = await db.subjects.add({
            name: chapter.title,
            parentId: subjectId,
            color: '#3d2b1f', 
            icon: '📖',
            priority: 'medium',
            createdAt: Date.now(),
            updatedAt: 1,
            isPreset: true,
            archived: false,
            userId,
            syncId: chapterSyncId
          } as Subject) as number;
        }

        if (chapter.topics && chapter.topics.length > 0) {
          await syncTopicsByName(chapterId, chapter.topics, userId, chapterPath);
        }
      }
    } 
    // B. Handle Flat Topics
    else if (data.topics && data.topics.length > 0) {
      await syncTopicsByName(subjectId, data.topics, userId, currentPath);
    }
  }
}

async function syncTopicsByName(subjectId: number, topicNames: string[], userId: string, pathPrefix: string) {
    const existingTopics = await db.topics
        .where('subjectId').equals(subjectId)
        .and(t => t.userId === userId)
        .toArray();
    
    for (const name of topicNames) {
        const syncId = generateDeterministicSyncId('topic', `${pathPrefix}:${name.toLowerCase().replace(/ /g, '_')}`);
        let existing = existingTopics.find(t => t.syncId === syncId);
        if (!existing) {
            existing = existingTopics.find(t => normalizeName(t.name) === normalizeName(name));
        }

        if (existing) {
            await db.topics.update(existing.id!, { name, syncId, updatedAt: 1 });
        } else {
            await db.topics.add({
                subjectId,
                name,
                isCompleted: false,
                status: 'not-started',
                learningProgress: 0,
                revisionCount: 0,
                masteryLevel: 0,
                updatedAt: 1,
                userId,
                syncId
            });
        }
    }
}

async function syncHierarchicalRoot(parentId: number, syllabus: any[], userId: string, pathPrefix: string) {
    // 1. Cleanup old chapters that are no longer in syllabus
    const existing = await db.subjects
        .where('parentId').equals(parentId)
        .and(s => s.userId === userId)
        .toArray();
    for (const sub of existing) {
        const isValid = syllabus.some(c => c.title === sub.name);
        if (!isValid) await deleteSubjectTree(sub.id!, userId);
    }

    // 2. Sync existing/new chapters
    for (const chapter of syllabus) {
        const currentPath = `${pathPrefix}:${chapter.title.toLowerCase().replace(/ /g, '_')}`;
        const syncId = generateDeterministicSyncId('subject', currentPath);
        
        let chapterId: number;
        const currentChildren = await db.subjects.where('parentId').equals(parentId).toArray();
        let existingChapter = currentChildren.find(s => s.syncId === syncId);
        if (!existingChapter) {
            existingChapter = currentChildren.find(s => normalizeName(s.name) === normalizeName(chapter.title));
        }
        
        if (!existingChapter) {
            chapterId = await db.subjects.add({
                name: chapter.title,
                parentId: parentId,
                color: '#3d2b1f', 
                icon: '📖',
                priority: 'medium',
                createdAt: Date.now(),
                updatedAt: 1,
                isPreset: true,
                archived: false,
                userId,
                syncId
            } as Subject) as number;
        } else {
            chapterId = existingChapter.id!;
            await db.subjects.update(chapterId, { archived: false, syncId, updatedAt: 1 });
        }

        // Sync topics by name
        if (chapter.topics && chapter.topics.length > 0) {
            await syncTopicsByName(chapterId, chapter.topics, userId, currentPath);
        }
    }
}

async function deleteSubjectTree(id: number, userId: string) {
    const children = await db.subjects
        .where('parentId').equals(id)
        .and(s => s.userId === userId)
        .toArray();
    for (const child of children) {
        await deleteSubjectTree(child.id!, userId);
    }
    await db.subjects.delete(id);
    await db.topics.where('subjectId').equals(id).delete();
    await db.logs.where('subjectId').equals(id).delete();
}

async function deduplicateParent(name: string, icon: string, color: string, userId: string, pathPrefix: string): Promise<number> {
    const syncId = generateDeterministicSyncId('subject', pathPrefix);
    const allSubjects = await db.subjects.where('userId').equals(userId).toArray();
    
    // Find by syncId or name
    let parents = allSubjects.filter(s => s.syncId === syncId);
    if (parents.length === 0) {
        parents = allSubjects.filter(s => !s.parentId && normalizeName(s.name) === normalizeName(name));
    }

    if (parents.length === 0) {
        return await db.subjects.add({
            name, color, icon, priority: 'high', createdAt: Date.now(), updatedAt: 1, isPreset: true, archived: false, userId, syncId
        } as Subject) as number;
    }
    const [master, ...redundant] = parents;
    const masterId = master.id!;
    if (redundant.length > 0) {
        for (const red of redundant) {
            await deleteSubjectTree(red.id!, userId);
        }
    }
    await db.subjects.update(masterId, { icon, color, archived: false, syncId, updatedAt: 1 });
    return masterId;
}

async function nuclearCleanup(userId: string) {
    console.log(`🧹 Nuclear Cleanup: Starting check for [${userId}]`);
    const allSubjects = await db.subjects.where('userId').equals(userId).toArray();
    console.log(`🧹 Nuclear Cleanup: Found ${allSubjects.length} subjects to check.`);
    const seen = new Map<string, number>(); // key: parentId-normalizedName, value: id
    
    for (const s of allSubjects) {
        // Use 0 as a consistent baseline for missing parentId
        const pid = s.parentId || 0;
        const key = `${pid}-${normalizeName(s.name)}`;
        const existingId = seen.get(key);
        
        if (existingId && existingId !== s.id) {
            console.warn(`Explanation: Detailed log for subject merge.`);
            console.warn(`🧹 Nuclear Cleanup: Found duplicate subject [${s.name}] (ID: ${s.id}). Merging into (ID: ${existingId})...`);
            try {
                // Move any topics/logs from this duplicate to the original
                await db.topics.where('subjectId').equals(s.id!).modify({ subjectId: existingId });
                await db.logs.where('subjectId').equals(s.id!).modify({ subjectId: existingId });
                await db.subjects.where('parentId').equals(s.id!).modify({ parentId: existingId });
                
                // Delete the duplicate
                await db.subjects.delete(s.id!);
                console.log(`🧹 Nuclear Cleanup: Deleted duplicate subject [${s.id}].`);
                
                // IMMEDIATELY deduplicate topics for the target subject
                await deduplicateAllTopics(userId);
            } catch (err) {
                console.error(`🧹 Nuclear Cleanup: Failed to merge duplicate [${s.id}]:`, err);
            }
        } else {
            seen.set(key, s.id!);
        }
    }
    console.log(`🧹 Nuclear Cleanup: Check complete.`);
}

async function deduplicateAllTopics(userId: string) {
    const allTopics = await db.topics.where('userId').equals(userId).toArray();
    const seen = new Set<string>();
    const dupIds: number[] = [];
    for (const t of allTopics) {
        const key = `${t.subjectId}-${normalizeName(t.name)}`;
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
