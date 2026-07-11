import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@renderer/store';
import type { TabMetadata } from '@shared/types/tabs';

export interface UseTabsResult {
  all: TabMetadata[];
  activeId: string | null;
  activePath: string;
  canGoBack: boolean;
  canGoForward: boolean;
  open: (path: string) => void;
  openHome: () => void;
  close: (tabId: string) => void;
  activate: (tabId: string) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  back: () => void;
  forward: () => void;
}

/** All tab lifecycle behavior for the renderer — TabStrip and its page never touch the store directly. */
export function useTabs(): UseTabsResult {
  const {
    tabs,
    activeTabId,
    wellKnownDirs,
    openTab,
    closeTab,
    activateTab,
    reorderTabs,
    goBack,
    goForward,
  } = useAppStore(
    useShallow((state) => ({
      tabs: state.tabs,
      activeTabId: state.activeTabId,
      wellKnownDirs: state.wellKnownDirs,
      openTab: state.openTab,
      closeTab: state.closeTab,
      activateTab: state.activateTab,
      reorderTabs: state.reorderTabs,
      goBack: state.goBack,
      goForward: state.goForward,
    })),
  );

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;

  const openHome = useCallback(() => {
    openTab(wellKnownDirs?.home ?? '/');
  }, [openTab, wellKnownDirs]);

  return {
    all: tabs,
    activeId: activeTabId,
    activePath: activeTab?.path ?? '',
    canGoBack: (activeTab?.history.back.length ?? 0) > 0,
    canGoForward: (activeTab?.history.forward.length ?? 0) > 0,
    open: openTab,
    openHome,
    close: closeTab,
    activate: activateTab,
    reorder: reorderTabs,
    back: () => activeTabId !== null && goBack(activeTabId),
    forward: () => activeTabId !== null && goForward(activeTabId),
  };
}
