export interface DictionaryEntry {
  id: string;
  word: string;
  phonetic: string;
  meanings: {
    partOfSpeech: string;
    definition: string;
    synonyms: string[];
    antonyms: string[];
    example: string;
  }[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  audioUrl?: string;
}

export interface Story {
  id: string;
  title: string;
  content: string; // The full text
  summary: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'Motivational' | 'Moral' | 'Classic' | 'Aesop' | 'Modern';
  author?: string;
  coverImage?: string; // Optional URL for cover
  readingTime?: string;
  difficultWords: string[]; // IDs of words in the dictionary
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // Index of correct option
  }[];
}

export interface GrammarRule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  explanation: string;
  examples: string[];
  commonMistakes: {
    incorrect: string;
    correct: string;
    explanation: string;
  }[];
  storyContext?: {
    title: string;
    content: string;
    highlightedRuleWrapper: string; // Description of the highlighted rule
  };
  practice: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

export interface UserProgress {
  wordsLearned: string[]; // IDs of learned words
  favoriteWords: string[]; // IDs of favorite words
  storiesRead: string[]; // IDs of completed stories
  favoriteStories: string[]; // IDs of stories marked for later
  grammarTopicsMastered: string[]; // IDs of mastered grammar topics
  dailyStreak: number;
  lastStudyDate: string | null;
  vocabularyIndex: number;
  shuffledWordIds: string[] | null;
  vocabularySessionId: string;
  wordsRead: string[];
  wordConfidence: Record<string, number>; // Map of word ID to confidence level (1-5)
  updatedAt?: number;
}
