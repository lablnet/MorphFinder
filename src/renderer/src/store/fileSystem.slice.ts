import type { StateCreator } from 'zustand';
import type { AppStore } from './index';

export interface WellKnownDirs {
  home: string;
  desktop: string;
  documents: string;
  downloads: string;
}

/** Fetched once at startup (see hooks/useWellKnownDirs.ts) and reused by the sidebar
 *  of every shell — durable enough to belong in the store rather than a hook. */
export interface FileSystemSlice {
  wellKnownDirs: WellKnownDirs | null;
  setWellKnownDirs: (dirs: WellKnownDirs) => void;
}

export const createFileSystemSlice: StateCreator<AppStore, [], [], FileSystemSlice> = (set) => ({
  wellKnownDirs: null,
  setWellKnownDirs: (dirs) => set({ wellKnownDirs: dirs }),
});
