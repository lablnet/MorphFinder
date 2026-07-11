import type { StateCreator } from 'zustand';
import type { TabMetadata } from '@shared/types/tabs';
import { basenameOf } from '@shared/constants';
import type { AppStore } from './index';

export interface TabsSlice {
  tabs: TabMetadata[];
  activeTabId: string | null;
  openTab: (path: string, options?: { activate?: boolean }) => string;
  closeTab: (tabId: string) => void;
  activateTab: (tabId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  /** Points the active tab at a new directory, pushing the old one onto its back stack. */
  navigateActiveTab: (path: string) => void;
  goBack: (tabId: string) => void;
  goForward: (tabId: string) => void;
  setActiveTabViewMode: (viewMode: TabMetadata['viewMode']) => void;
  activeTab: () => TabMetadata | null;
}

export const createTabsSlice: StateCreator<AppStore, [], [], TabsSlice> = (set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (path, options) => {
    const tab: TabMetadata = {
      id: crypto.randomUUID(),
      path,
      title: basenameOf(path),
      history: { back: [], forward: [] },
      viewMode: get().defaultViewModeForActiveShell(),
      isPinned: false,
    };
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: options?.activate === false ? state.activeTabId : tab.id,
    }));
    return tab.id;
  },

  activateTab: (tabId) => set({ activeTabId: tabId }),

  closeTab: (tabId) =>
    set((state) => {
      const closingIndex = state.tabs.findIndex((tab) => tab.id === tabId);
      const remaining = state.tabs.filter((tab) => tab.id !== tabId);
      if (state.activeTabId !== tabId) return { tabs: remaining };

      // Prefer the tab that took this one's place, falling back to the new last tab —
      // mirrors Finder/Explorer/Dolphin close-tab focus behavior.
      const nextActive = remaining[closingIndex] ?? remaining.at(-1);
      return { tabs: remaining, activeTabId: nextActive?.id ?? null };
    }),

  reorderTabs: (fromIndex, toIndex) =>
    set((state) => {
      const next = [...state.tabs];
      const [moved] = next.splice(fromIndex, 1);
      if (moved === undefined) return {};
      next.splice(toIndex, 0, moved);
      return { tabs: next };
    }),

  navigateActiveTab: (path) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === state.activeTabId
          ? {
              ...tab,
              path,
              title: basenameOf(path),
              history: { back: [...tab.history.back, tab.path], forward: [] },
            }
          : tab,
      ),
    })),

  goBack: (tabId) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId) return tab;
        const previousPath = tab.history.back.at(-1);
        if (previousPath === undefined) return tab;
        return {
          ...tab,
          path: previousPath,
          title: basenameOf(previousPath),
          history: {
            back: tab.history.back.slice(0, -1),
            forward: [tab.path, ...tab.history.forward],
          },
        };
      }),
    })),

  goForward: (tabId) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId) return tab;
        const nextPath = tab.history.forward[0];
        if (nextPath === undefined) return tab;
        return {
          ...tab,
          path: nextPath,
          title: basenameOf(nextPath),
          history: {
            back: [...tab.history.back, tab.path],
            forward: tab.history.forward.slice(1),
          },
        };
      }),
    })),

  setActiveTabViewMode: (viewMode) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === state.activeTabId ? { ...tab, viewMode } : tab)),
    })),

  activeTab: () => get().tabs.find((tab) => tab.id === get().activeTabId) ?? null,
});
