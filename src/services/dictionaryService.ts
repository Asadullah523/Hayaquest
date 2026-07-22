/**
 * Service to fetch synonyms using Datamuse API
 * and definitions using Free Dictionary API
 */

import type { DictionaryEntry } from '../types/english';
import { v4 as uuidv4 } from 'uuid';

export interface SynonymResult {
  word: string;
  score: number;
}

const DATAMUSE_API = 'https://api.datamuse.com/words';
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export async function getSynonyms(word: string): Promise<string[]> {
  if (!word.trim()) return [];

  try {
    // ml = means like (synonyms)
    const response = await fetch(`${DATAMUSE_API}?ml=${encodeURIComponent(word)}&max=10`);
    
    if (!response.ok) {
      throw new Error(`Datamuse API returned ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: SynonymResult[] = await response.json();
    
    // Return top 5 synonyms
    return data.map(item => item.word).slice(0, 5);
  } catch (error) {
    console.error('Error fetching synonyms:', error);
    return [];
  }
}

export async function fetchWordDefinition(word: string): Promise<DictionaryEntry | null> {
  try {
    const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(word)}`);
    
    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch definition');
    }

    const data = await response.json();
    const entry = data[0]; // Take the first result

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioUrl = entry.phonetics?.find((p: any) => p.audio && p.audio.length > 0)?.audio || '';

    return {
        id: uuidv4(),
        word: entry.word,
        phonetic: entry.phonetic || (entry.phonetics && entry.phonetics[0]?.text) || '',
        audioUrl,
        difficulty: 'intermediate', // Default as API doesn't provide this
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        meanings: entry.meanings.map((m: any) => ({
            partOfSpeech: m.partOfSpeech,
            definition: m.definitions[0]?.definition || '',
            example: m.definitions[0]?.example || '',
            synonyms: m.synonyms || [],
            antonyms: m.antonyms || []
        }))
    };
  } catch (error) {
    console.error("Error fetching definition:", error);
    return null;
  }
}
