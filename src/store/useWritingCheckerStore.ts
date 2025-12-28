import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncService } from '../services/syncService';
import type { Draft, UserPreferences } from '../types/writingChecker';

interface WritingCheckerState {
  drafts: Draft[];
  currentDraftId: string | null;
  preferences: UserPreferences;
  updatedAt?: number;
  
  // Actions
  saveDraft: (draft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateDraft: (id: string, updates: Partial<Draft>) => void;
  deleteDraft: (id: string) => void;
  loadDraft: (id: string) => Draft | null;
  setCurrentDraft: (id: string | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

export const useWritingCheckerStore = create<WritingCheckerState>()(
  persist(
    (set, get) => ({
      drafts: [],
      currentDraftId: null,
      preferences: {
        autoCheck: true,
        checkAsYouType: true,
        highlightSeverity: ['error', 'warning', 'info'],
      },
      updatedAt: 0,

      saveDraft: (draft) => {
        const now = Date.now();
        const newDraft: Draft = {
          ...draft,
          id: `draft-${now}`,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          drafts: [newDraft, ...state.drafts],
          currentDraftId: newDraft.id,
          updatedAt: now,
        }));
        
        syncService.triggerAutoBackup();

        return newDraft.id;
      },

      updateDraft: (id, updates) => {
        set((state) => ({
          drafts: state.drafts.map((draft) =>
            draft.id === id
              ? { ...draft, ...updates, updatedAt: Date.now() }
              : draft
          ),
          updatedAt: Date.now(),
        }));
        syncService.triggerAutoBackup();
      },

      deleteDraft: (id) => {
        set((state) => ({
          drafts: state.drafts.filter((draft) => draft.id !== id),
          currentDraftId: state.currentDraftId === id ? null : state.currentDraftId,
          updatedAt: Date.now(),
        }));
        syncService.triggerAutoBackup();
      },

      loadDraft: (id) => {
        const draft = get().drafts.find((d) => d.id === id);
        return draft || null;
      },

      setCurrentDraft: (id) => {
        set({ currentDraftId: id, updatedAt: Date.now() });
        syncService.triggerAutoBackup();
      },

      updatePreferences: (preferences) => {
        set({
          preferences: { ...get().preferences, ...preferences },
          updatedAt: Date.now(),
        });
        syncService.triggerAutoBackup();
      },
    }),
    {
      name: 'writing-checker-storage',
    }
  )
);
