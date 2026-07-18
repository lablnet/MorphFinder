import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createLayoutSlice, type LayoutSlice } from './layout.slice';
import { createTabsSlice, type TabsSlice } from './tabs.slice';
import { createSelectionSlice, type SelectionSlice } from './selection.slice';
import { createFileSystemSlice, type FileSystemSlice } from './fileSystem.slice';

export type AppStore = LayoutSlice & TabsSlice & SelectionSlice & FileSystemSlice;

/**
 * One store, four domain slices (see store/*.slice.ts). Only shell/theme/tabs
 * survive a restart — selection and the well-known-dirs cache are session-only,
 * so they're excluded in `partialize` below.
 */
const getStorageKey = (): string => {
  if (typeof window === 'undefined' || !window.location || !window.location.search) return 'MorphFinder-store';
  const params = new URLSearchParams(window.location.search);
  const windowId = params.get('windowId') || 'main';
  return `MorphFinder-store-${windowId}`;
};

export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createLayoutSlice(...args),
      ...createTabsSlice(...args),
      ...createSelectionSlice(...args),
      ...createFileSystemSlice(...args),
    }),
    {
      name: getStorageKey(),
      partialize: (state) => ({
        activeShell: state.activeShell,
        themeMode: state.themeMode,
        showHiddenFiles: state.showHiddenFiles,
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        pinnedFolders: state.pinnedFolders,
      }),
    },
  ),
);
