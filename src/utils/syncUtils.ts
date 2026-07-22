import { normalizeName } from './stringUtils';

/**
 * Generates a deterministic syncId for preset subjects and topics.
 * This ensures that a subject like "Biology" under "IMAT Prep" has the same 
 * ID on a phone, website, Chrome, or Opera.
 */
export const generateDeterministicSyncId = (type: 'subject' | 'topic', path: string) => {
    // Standardize path: lowercased, spaces to underscores, remove special chars
    const cleanPath = path.toLowerCase()
        .replace(/ /g, '_')
        .replace(/[^a-z0-9:_]/g, '');
    return `${type}:${cleanPath}`;
};

/**
 * Generate a random syncId for custom user-created items.
 */
export const generateRandomSyncId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
};

/**
 * Returns a legacy key for subject matching (parentId-name)
 */
export const getLegacySubjectKey = (subject: { parentId?: number, name: string }) => {
    return `${subject.parentId || 0}-${normalizeName(subject.name)}`;
};

/**
 * Returns a legacy key for topic matching (subjectId-name)
 */
export const getLegacyTopicKey = (topic: { subjectId: number, name: string }) => {
    return `${topic.subjectId}-${normalizeName(topic.name)}`;
};
