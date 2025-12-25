import type { WritingStatistics } from '../types/writingChecker';

/**
 * Calculate comprehensive writing statistics
 */
export function analyzeText(text: string): WritingStatistics {
  const trimmedText = text.trim();
  
  if (!trimmedText) {
    return {
      characters: 0,
      charactersWithoutSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      averageWordsPerSentence: 0,
      readingTime: 0,
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
      uniqueWords: 0,
      wordFrequency: [],
      passiveVoiceCount: 0,
      tone: [],
      cliches: [],
      healthScore: 100,
    };
  }

  const characters = trimmedText.length;
  const charactersWithoutSpaces = trimmedText.replace(/\s/g, '').length;
  
  // Word counting
  const words = trimmedText.match(/\b[\w'-]+\b/g) || [];
  const wordCount = words.length;
  
  // Sentence counting (split by .!?)
  // Simpler approach: Split and count non-empty segments
  const segments = trimmedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = segments.length > 0 ? segments.length : (trimmedText.length > 0 ? 1 : 0);
  
  // Paragraph counting
  const paragraphs = trimmedText.split(/\n\n+/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;
  
  // Average words per sentence
  const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  
  // Reading time (average 200 words per minute)
  const readingTime = wordCount / 200;
  
  // Syllable counting (approximation)
  const syllableCount = words.reduce((total, word) => {
    return total + countSyllables(word);
  }, 0);
  
  // Flesch Reading Ease: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  let fleschReadingEase = 0;
  if (wordCount > 0 && sentenceCount > 0) {
    fleschReadingEase = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
    fleschReadingEase = Math.max(0, Math.min(100, fleschReadingEase)); // Clamp between 0-100
  }
  
  // Flesch-Kincaid Grade Level: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  let fleschKincaidGrade = 0;
  if (wordCount > 0 && sentenceCount > 0) {
    fleschKincaidGrade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
    fleschKincaidGrade = Math.max(0, fleschKincaidGrade);
  }
  
  // Unique words
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  
  // Word frequency
  const wordFrequencyMap = new Map<string, number>();
  words.forEach(word => {
    const lower = word.toLowerCase();
    wordFrequencyMap.set(lower, (wordFrequencyMap.get(lower) || 0) + 1);
  });
  
  const wordFrequency = Array.from(wordFrequencyMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 most frequent words
  
  // Passive voice detection (simple heuristic)
  const passiveVoiceCount = detectPassiveVoice(trimmedText);

  // Tone Detection
  const tone = detectTone(trimmedText, words);

  // Weak Words / Cliches
  const cliches = detectCliches(trimmedText);
  
  return {
    characters,
    charactersWithoutSpaces,
    words: wordCount,
    sentences: sentenceCount,
    paragraphs: paragraphCount,
    averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
    readingTime: Math.ceil(readingTime),
    fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
    fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
    uniqueWords,
    wordFrequency,
    passiveVoiceCount,
    tone,
    cliches,
    healthScore: 0, // Will be calculated by the component using calculateHealthScore
  };
}

/**
 * Detect the tone of the text
 */
function detectTone(text: string, words: string[]): string[] {
  const tones: Set<string> = new Set();
  const lowerText = text.toLowerCase();

  // Formal
  if (/\b(however|therefore|consequently|furthermore|regarding|accordingly)\b/.test(lowerText) && !words.includes('lol')) {
    tones.add('👔 Formal');
  }

  // Casual
  if (/\b(lol|haha|cool|stuff|things|kinda|gonna)\b/.test(lowerText) || /!{2,}/.test(text)) {
    tones.add('🙂 Casual');
  }

  // Optimistic
  if (/\b(great|awesome|excellent|happy|love|best|perfect|wonderful|excited)\b/.test(lowerText)) {
    tones.add('✨ Optimistic');
  }

  // Urgent
  if (/\b(urgent|asap|immediately|now|critical|important|alert)\b/.test(lowerText)) {
    tones.add('⚡ Urgent');
  }

  // Confident
  if (/\b(definitely|certainly|surely|will|must|undoubtedly)\b/.test(lowerText)) {
    tones.add('💪 Confident');
  }

  // Default
  if (tones.size === 0) {
    return ['😐 Neutral'];
  }

  return Array.from(tones);
}

/**
 * Detect cliches and weak words
 */
function detectCliches(text: string): string[] {
  const weakWords = ['very', 'really', 'literally', 'basic', 'things', 'stuff'];
  const found: Set<string> = new Set();
  const lowerText = text.toLowerCase();

  weakWords.forEach(word => {
    if (new RegExp(`\\b${word}\\b`).test(lowerText)) {
      found.add(word);
    }
  });

  return Array.from(found);
}

/**
 * Calculate a health score (0-100) based on errors and statistics
 */
export function calculateHealthScore(stats: WritingStatistics, errorCount: number): number {
  if (stats.words === 0) return 100;

  // Base score
  let score = 100;

  // Deduction for errors (more weight to errors than warnings)
  // Assuming 1 error per 100 words is a ~5 point deduction
  const errorDensity = (errorCount / stats.words) * 100;
  score -= errorDensity * 10;

  // Deduction for low readability (Flesch Reading Ease)
  // Standard (60) is neutral. Below 40 is difficult.
  if (stats.fleschReadingEase < 60) {
    score -= (60 - stats.fleschReadingEase) * 0.2;
  }

  // Deduction for passive voice density
  const passiveDensity = (stats.passiveVoiceCount / (stats.sentences || 1));
  if (passiveDensity > 0.2) {
    score -= (passiveDensity - 0.2) * 50;
  }

  // Vocabulary diversity bonus (0-5 points)
  const diversity = stats.words > 0 ? stats.uniqueWords / stats.words : 0;
  if (diversity > 0.6) score += 5;
  else if (diversity > 0.4) score += 2;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Count syllables in a word (approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  let syllables = vowelGroups ? vowelGroups.length : 1;
  
  // Adjust for silent 'e'
  if (word.endsWith('e')) syllables--;
  
  // Adjust for 'le' ending
  if (word.endsWith('le') && word.length > 2) {
    const prevChar = word[word.length - 3];
    if (!/[aeiouy]/.test(prevChar)) syllables++;
  }
  
  return Math.max(1, syllables);
}

/**
 * Detect passive voice constructions (simple heuristic)
 */
function detectPassiveVoice(text: string): number {
  const passivePatterns = [
    /\b(am|is|are|was|were|been|be|being)\s+\w+ed\b/gi,
    /\b(am|is|are|was|were|been|be|being)\s+\w+en\b/gi,
  ];
  
  let count = 0;
  passivePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  });
  
  return count;
}

/**
 * Get readability level description
 */
export function getReadabilityLevel(score: number): { level: string; description: string; color: string } {
  if (score >= 90) {
    return { level: 'Very Easy', description: '5th grade', color: 'text-emerald-600' };
  } else if (score >= 80) {
    return { level: 'Easy', description: '6th grade', color: 'text-green-600' };
  } else if (score >= 70) {
    return { level: 'Fairly Easy', description: '7th grade', color: 'text-lime-600' };
  } else if (score >= 60) {
    return { level: 'Standard', description: '8th-9th grade', color: 'text-yellow-600' };
  } else if (score >= 50) {
    return { level: 'Fairly Difficult', description: '10th-12th grade', color: 'text-orange-600' };
  } else if (score >= 30) {
    return { level: 'Difficult', description: 'College level', color: 'text-red-600' };
  } else {
    return { level: 'Very Difficult', description: 'College graduate', color: 'text-red-700' };
  }
}

/**
 * Find repeated words in close proximity
 */
export function findRepeatedWords(text: string, proximity: number = 10): Array<{ word: string; positions: number[] }> {
  const words = text.match(/\b[\w'-]+\b/g) || [];
  const wordMap = new Map<string, number[]>();
  
  words.forEach((word, index) => {
    const lower = word.toLowerCase();
    if (!wordMap.has(lower)) {
      wordMap.set(lower, []);
    }
    wordMap.get(lower)!.push(index);
  });
  
  const repeated: Array<{ word: string; positions: number[] }> = [];
  
  wordMap.forEach((positions, word) => {
    if (positions.length > 1) {
      // Check if any occurrences are within proximity
      for (let i = 0; i < positions.length - 1; i++) {
        if (positions[i + 1] - positions[i] <= proximity) {
          repeated.push({ word, positions });
          break;
        }
      }
    }
  });
  
  return repeated;
}

/**
 * Export text to various formats
 */
export function exportText(text: string, format: 'txt' | 'pdf'): void {
  const blob = new Blob([text], { type: format === 'pdf' ? 'application/pdf' : 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `writing-${Date.now()}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
