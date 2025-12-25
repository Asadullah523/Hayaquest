import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProgress } from '../types/english';

interface EnglishStore extends UserProgress {
  markWordAsLearned: (wordId: string) => void;
  toggleFavoriteWord: (wordId: string) => void;
  markStoryAsRead: (storyId: string) => void;
  toggleFavoriteStory: (storyId: string) => void;
  markGrammarTopicAsMastered: (topicId: string) => void;
  updateDailyStreak: () => void;
  setVocabularyIndex: (index: number) => void;
  shuffleVocabulary: (allWords: string[]) => void;
  clearShuffle: () => void;
  resetProgress: () => void;
  markWordAsRead: (wordId: string) => void;
}

export const useEnglishStore = create<EnglishStore>()(
  persist(
    (set, get) => ({
      wordsLearned: [],
      wordConfidence: {},
      favoriteWords: [],
      storiesRead: [],
      favoriteStories: [],
      grammarTopicsMastered: [],
      dailyStreak: 0,
      lastStudyDate: '',
      vocabularyIndex: 0,
      shuffledWordIds: null,
      vocabularySessionId: 'initial',
      wordsRead: [],

      markWordAsLearned: (wordId) =>
        set((state) => {
          const newWordsLearned = state.wordsLearned.includes(wordId)
            ? state.wordsLearned
            : [...state.wordsLearned, wordId];
          
          // If the word is learned, we should also remove it from the shuffled list if it exists
          const newShuffledWordIds = state.shuffledWordIds 
            ? state.shuffledWordIds.filter(id => id !== wordId)
            : null;

          return {
            wordsLearned: newWordsLearned,
            shuffledWordIds: newShuffledWordIds,
          };
        }),

      toggleFavoriteWord: (wordId) =>
        set((state) => ({
          favoriteWords: state.favoriteWords.includes(wordId)
            ? state.favoriteWords.filter(id => id !== wordId)
            : [...state.favoriteWords, wordId],
        })),

      markStoryAsRead: (storyId) =>
        set((state) => ({
          storiesRead: state.storiesRead.includes(storyId)
            ? state.storiesRead
            : [...state.storiesRead, storyId],
        })),

      toggleFavoriteStory: (storyId) =>
        set((state) => ({
          favoriteStories: state.favoriteStories.includes(storyId)
            ? state.favoriteStories.filter(id => id !== storyId)
            : [...state.favoriteStories, storyId],
        })),

      markGrammarTopicAsMastered: (topicId) =>
        set((state) => ({
          grammarTopicsMastered: state.grammarTopicsMastered.includes(topicId)
            ? state.grammarTopicsMastered
            : [...state.grammarTopicsMastered, topicId],
        })),

      updateDailyStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastStudyDate, dailyStreak } = get();
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastStudyDate === today) {
          return;
        } else if (lastStudyDate === yesterdayStr) {
          set({ dailyStreak: dailyStreak + 1, lastStudyDate: today });
        } else {
          set({ dailyStreak: 1, lastStudyDate: today });
        }
      },

      setVocabularyIndex: (index) => set({ vocabularyIndex: index }),

      shuffleVocabulary: (allWordIds) => {
        const shuffled = [...allWordIds];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        set({ 
          shuffledWordIds: shuffled,
          vocabularyIndex: Math.floor(Math.random() * shuffled.length),
          vocabularySessionId: Date.now().toString()
        });
      },

      clearShuffle: () => set({ 
        shuffledWordIds: null, 
        vocabularyIndex: 0,
        vocabularySessionId: Date.now().toString()
      }),

      resetProgress: () => set({
        wordsLearned: [],
        wordsRead: [],
        vocabularyIndex: 0,
        shuffledWordIds: null,
        vocabularySessionId: Date.now().toString()
      }),

      markWordAsRead: (wordId) =>
        set((state) => ({
          wordsRead: state.wordsRead.includes(wordId)
            ? state.wordsRead
            : [...state.wordsRead, wordId],
        })),
    }),
    {
      name: 'english-storage',
    }
  )
);
