import type { StateCreator } from 'zustand';
import type { AppStore } from './index';

const EMPTY_SELECTION: string[] = [];

/** Keyed per tab so switching tabs never leaks one directory's selection into another. */
export interface SelectionSlice {
  selectedPathsByTab: Record<string, string[]>;
  anchorPathByTab: Record<string, string>;
  setSelection: (tabId: string, paths: string[], anchorPath?: string) => void;
  clearSelection: (tabId: string) => void;
  selectionFor: (tabId: string) => string[];
}

export const createSelectionSlice: StateCreator<AppStore, [], [], SelectionSlice> = (set, get) => ({
  selectedPathsByTab: {},
  anchorPathByTab: {},

  setSelection: (tabId, paths, anchorPath) =>
    set((state) => ({
      selectedPathsByTab: { ...state.selectedPathsByTab, [tabId]: paths },
      anchorPathByTab:
        anchorPath === undefined ? state.anchorPathByTab : { ...state.anchorPathByTab, [tabId]: anchorPath },
    })),

  clearSelection: (tabId) =>
    set((state) => {
      const next = { ...state.selectedPathsByTab };
      delete next[tabId];
      return { selectedPathsByTab: next };
    }),

  selectionFor: (tabId) => get().selectedPathsByTab[tabId] ?? EMPTY_SELECTION,
});
