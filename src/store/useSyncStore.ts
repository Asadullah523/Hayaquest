import { create } from 'zustand';

interface SyncStatus {
    isSyncing: boolean;
    lastSyncTime: number | null;
    error: string | null;
}

interface SyncState {
    status: SyncStatus;
    setSyncing: (isSyncing: boolean) => void;
    setLastSyncTime: (time: number) => void;
    setError: (error: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
    status: {
        isSyncing: false,
        lastSyncTime: null,
        error: null,
    },
    setSyncing: (isSyncing) => set((state) => ({ status: { ...state.status, isSyncing } })),
    setLastSyncTime: (time) => set((state) => ({ status: { ...state.status, lastSyncTime: time } })),
    setError: (error) => set((state) => ({ status: { ...state.status, error } })),
}));
