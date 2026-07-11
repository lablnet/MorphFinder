import { useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@renderer/store';
import { CACHE_CLEANER_PATH, SPACE_ANALYZER_PATH, DEV_PANEL_PATH } from '@shared/constants';
import { ipc } from '@renderer/services/ipc';
import type { FileSystemNode } from '@shared/types/fileSystem';
import type { UIShell, UIThemeMode } from '@shared/types/layout';

export interface CommandItem {
  id: string;
  category: 'Navigation' | 'Settings' | 'Actions' | 'Current Folder';
  label: string;
  description?: string;
  icon: string; // lucide icon name
  action: () => void;
}

interface UseCommandPaletteProps {
  currentNodes: FileSystemNode[];
  onOpenNode: (node: FileSystemNode) => void;
  onCreateFolder?: () => void;
  onRefresh?: () => void;
}

export function useCommandPalette({
  currentNodes,
  onOpenNode,
  onCreateFolder,
  onRefresh,
}: UseCommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const {
    activeShell,
    setShell,
    themeMode,
    setThemeMode,
    showHiddenFiles,
    toggleHiddenFiles,
    wellKnownDirs,
    //tabs,
    openTab,
    closeTab,
    activeTabId,
  } = useAppStore(
    useShallow((state) => ({
      activeShell: state.activeShell,
      setShell: state.setShell,
      themeMode: state.themeMode,
      setThemeMode: state.setThemeMode,
      showHiddenFiles: state.showHiddenFiles,
      toggleHiddenFiles: state.toggleHiddenFiles,
      wellKnownDirs: state.wellKnownDirs,
      tabs: state.tabs,
      openTab: state.openTab,
      closeTab: state.closeTab,
      activeTabId: state.activeTabId,
    })),
  );

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setSearchQuery('');
        setActiveIndex(0);
      }
      return !prev;
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Keyboard shortcut listener to toggle: Cmd+K (Mac) or Ctrl+K (Others)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const isMod = event.metaKey || event.ctrlKey;
      if (isMod && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggleOpen();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleOpen]);

  // Listen for main process command-palette:toggle events
  useEffect(() => {
    const unsubscribe = ipc.on('command-palette:toggle', () => {
      toggleOpen();
    });
    return unsubscribe;
  }, [toggleOpen]);

  // Define static commands & locations
  const items = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [];

    // --- NAVIGATION ---
    if (wellKnownDirs) {
      list.push({
        id: 'nav-home',
        category: 'Navigation',
        label: 'Go to Home',
        description: wellKnownDirs.home,
        icon: 'Home',
        action: () => openTab(wellKnownDirs.home),
      });
      list.push({
        id: 'nav-desktop',
        category: 'Navigation',
        label: 'Go to Desktop',
        description: wellKnownDirs.desktop,
        icon: 'Monitor',
        action: () => openTab(wellKnownDirs.desktop),
      });
      list.push({
        id: 'nav-documents',
        category: 'Navigation',
        label: 'Go to Documents',
        description: wellKnownDirs.documents,
        icon: 'FileText',
        action: () => openTab(wellKnownDirs.documents),
      });
      list.push({
        id: 'nav-downloads',
        category: 'Navigation',
        label: 'Go to Downloads',
        description: wellKnownDirs.downloads,
        icon: 'Download',
        action: () => openTab(wellKnownDirs.downloads),
      });
    }
    list.push({
      id: 'nav-root',
      category: 'Navigation',
      label: 'Go to Local Disk (Root)',
      description: '/',
      icon: 'HardDrive',
      action: () => openTab('/'),
    });
    list.push({
      id: 'nav-cache-cleaner',
      category: 'Navigation',
      label: 'Open Cache Cleaner',
      description: CACHE_CLEANER_PATH,
      icon: 'Trash2',
      action: () => openTab(CACHE_CLEANER_PATH),
    });
    list.push({
      id: 'nav-space-analyzer',
      category: 'Navigation',
      label: 'Open Space Analyzer',
      description: SPACE_ANALYZER_PATH,
      icon: 'PieChart',
      action: () => openTab(SPACE_ANALYZER_PATH),
    });
    list.push({
      id: 'nav-dev-panel',
      category: 'Navigation',
      label: 'Open Dev Panel',
      description: DEV_PANEL_PATH,
      icon: 'Code2',
      action: () => openTab(DEV_PANEL_PATH),
    });

    // --- ACTIONS ---
    list.push({
      id: 'act-new-tab',
      category: 'Actions',
      label: 'New Tab',
      description: 'Open a new explorer tab',
      icon: 'Plus',
      action: () => openTab(wellKnownDirs?.home ?? '/'),
    });
    if (activeTabId) {
      list.push({
        id: 'act-close-tab',
        category: 'Actions',
        label: 'Close Active Tab',
        description: 'Close the current folder tab',
        icon: 'X',
        action: () => closeTab(activeTabId),
      });
    }
    if (onRefresh) {
      list.push({
        id: 'act-refresh',
        category: 'Actions',
        label: 'Refresh Directory',
        description: 'Reload files in current location',
        icon: 'RefreshCw',
        action: onRefresh,
      });
    }
    if (onCreateFolder) {
      list.push({
        id: 'act-create-folder',
        category: 'Actions',
        label: 'Create New Folder',
        description: 'Prompt to create a new subfolder',
        icon: 'FolderPlus',
        action: onCreateFolder,
      });
    }

    // --- SETTINGS ---
    list.push({
      id: 'set-hidden-files',
      category: 'Settings',
      label: showHiddenFiles ? 'Hide Hidden Files' : 'Show Hidden Files',
      description: `Currently ${showHiddenFiles ? 'visible' : 'hidden'}`,
      icon: 'Eye',
      action: () => toggleHiddenFiles(),
    });

    // Shell Switchers
    const shells: Array<{ key: UIShell; name: string }> = [
      { key: 'finder', name: 'Finder Layout (macOS)' },
      { key: 'explorer', name: 'Explorer Layout (Windows 11)' },
      { key: 'dolphin', name: 'Dolphin Layout (KDE)' },
    ];
    shells.forEach(({ key, name }) => {
      list.push({
        id: `set-shell-${key}`,
        category: 'Settings',
        label: `Switch UI Shell to ${name}`,
        description: activeShell === key ? 'Active shell' : 'Swap visual shell layout',
        icon: 'LayoutGrid',
        action: () => setShell(key),
      });
    });

    // Theme Switchers
    const themes: Array<{ key: UIThemeMode; name: string }> = [
      { key: 'light', name: 'Light Mode' },
      { key: 'dark', name: 'Dark Mode' },
      { key: 'system', name: 'System Default' },
    ];
    themes.forEach(({ key, name }) => {
      list.push({
        id: `set-theme-${key}`,
        category: 'Settings',
        label: `Set Theme to ${name}`,
        description: themeMode === key ? 'Active theme' : 'Adjust colors',
        icon: 'SunMoon',
        action: () => setThemeMode(key),
      });
    });

    // --- CURRENT DIRECTORY ITEMS ---
    currentNodes.forEach((node) => {
      list.push({
        id: `node-${node.path}`,
        category: 'Current Folder',
        label: node.name,
        description: node.path,
        icon: node.kind === 'directory' ? 'Folder' : 'File',
        action: () => onOpenNode(node),
      });
    });

    return list;
  }, [
    wellKnownDirs,
    activeTabId,
    showHiddenFiles,
    activeShell,
    themeMode,
    currentNodes,
    openTab,
    closeTab,
    toggleHiddenFiles,
    setShell,
    setThemeMode,
    onOpenNode,
    onCreateFolder,
    onRefresh,
  ]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)),
    );
  }, [items, searchQuery]);

  // Clamp active index when filtered items change
  useEffect(() => {
    setActiveIndex((prev) => {
      if (filteredItems.length === 0) return 0;
      return Math.min(prev, filteredItems.length - 1);
    });
  }, [filteredItems]);

  // Key handlers for open palette: Escape, Arrows, Enter
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const selectedItem = filteredItems[activeIndex];
        if (selectedItem) {
          selectedItem.action();
          close();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, filteredItems, activeIndex, close]);

  const selectIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const selectItem = useCallback(
    (item: CommandItem) => {
      item.action();
      close();
    },
    [close],
  );

  return {
    isOpen,
    searchQuery,
    setSearchQuery,
    activeIndex,
    filteredItems,
    toggleOpen,
    close,
    selectIndex,
    selectItem,
    activeShell,
  };
}
