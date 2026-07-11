import { useMemo } from 'react';
import { useAppStore } from '@renderer/store';

const EMPTY_SELECTION: string[] = [];

export interface UseSelectionResult {
  selectedPaths: string[];
  selectedSet: ReadonlySet<string>;
  set: (paths: string[], anchorPath?: string) => void;
  clear: () => void;
}

export function useSelection(): UseSelectionResult {
  const activeTabId = useAppStore((state) => state.activeTabId);
  const selectedPaths = useAppStore((state) => {
    if (state.activeTabId === null) return EMPTY_SELECTION;
    return state.selectedPathsByTab[state.activeTabId] ?? EMPTY_SELECTION;
  });
  const setSelection = useAppStore((state) => state.setSelection);
  const clearSelection = useAppStore((state) => state.clearSelection);
  const selectedSet = useMemo(() => new Set(selectedPaths), [selectedPaths]);

  return {
    selectedPaths,
    selectedSet,
    set: (paths, anchorPath) => {
      if (activeTabId !== null) setSelection(activeTabId, paths, anchorPath);
    },
    clear: () => {
      if (activeTabId !== null) clearSelection(activeTabId);
    },
  };
}
