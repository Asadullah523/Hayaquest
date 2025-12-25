export interface WritingError {
  id: string;
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: string[];
  category: 'GRAMMAR' | 'SPELLING' | 'STYLE' | 'PUNCTUATION' | 'TYPO';
  severity: 'error' | 'warning' | 'info';
  rule: string;
  context: {
    text: string;
    offset: number;
    length: number;
  };
}

export interface WritingStatistics {
  characters: number;
  charactersWithoutSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  averageWordsPerSentence: number;
  readingTime: number; // in minutes
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  uniqueWords: number;
  wordFrequency: { word: string; count: number }[];
  passiveVoiceCount: number;
  tone: string[];
  cliches: string[];
  healthScore: number;
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  statistics: WritingStatistics;
  errors?: WritingError[]; // Optional for backward compatibility and saving state
}

export interface LanguageToolResponse {
  software: {
    name: string;
    version: string;
  };
  language: {
    name: string;
    code: string;
  };
  matches: Array<{
    message: string;
    shortMessage: string;
    offset: number;
    length: number;
    replacements: Array<{ value: string }>;
    context: {
      text: string;
      offset: number;
      length: number;
    };
    rule: {
      id: string;
      description: string;
      category: {
        id: string;
        name: string;
      };
    };
    type: {
      typeName: string;
    };
  }>;
}

export interface UserPreferences {
  autoCheck: boolean;
  checkAsYouType: boolean;
  highlightSeverity: ('error' | 'warning' | 'info')[];
}
