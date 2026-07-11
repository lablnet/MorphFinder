import type { StateCreator } from 'zustand';
import { DEFAULT_VIEW_MODE_BY_SHELL, type UIShell, type UIThemeMode, type ViewMode } from '@shared/types/layout';
import type { DirectoryAnnotation } from '@shared/types/directoryAnnotations';
import type { FileSystemNode } from '@shared/types/fileSystem';
import type { AppStore } from './index';

export interface LayoutSlice {
  activeShell: UIShell;
  themeMode: UIThemeMode;
  showHiddenFiles: boolean;
  terminalOpen: boolean;
  terminalHeight: number;
  terminalQueuedCommand: { cwd: string; command: string; nonce: number } | null;
  setShell: (shell: UIShell) => void;
  /** Cmd/Ctrl+Shift+U — walks Finder → Explorer → Dolphin → Finder. */
  cycleShell: () => void;
  setThemeMode: (mode: UIThemeMode) => void;
  toggleHiddenFiles: () => void;
  /** Per-shell default so a freshly opened tab matches its shell's native convention. */
  defaultViewModeForActiveShell: () => ViewMode;
  setTerminalOpen: (open: boolean) => void;
  toggleTerminal: () => void;
  setTerminalHeight: (height: number) => void;
  queueTerminalCommand: (cwd: string, command: string) => void;
  clearTerminalQueuedCommand: () => void;
  
  // Annotation-Aware UI additions
  pinnedFolders: string[];
  pinFolder: (path: string) => void;
  unpinFolder: (path: string) => void;
  annotations: Record<string, DirectoryAnnotation>;
  setAnnotations: (annotations: DirectoryAnnotation[]) => void;
  updateAnnotation: (annotation: DirectoryAnnotation) => void;
  activeTagFilter: string | null;
  setActiveTagFilter: (tag: string | null) => void;
  detailsNode: FileSystemNode | null;
  openDetails: (node: FileSystemNode) => void;
  closeDetails: () => void;
}

const SHELL_CYCLE_ORDER: UIShell[] = ['finder', 'explorer', 'dolphin'];

/** First-launch guess only — `setShell` (persisted) always wins after that. */
function detectPlatformDefaultShell(): UIShell {
  const platform = window.navigator.platform.toLowerCase();
  if (platform.includes('win')) return 'explorer';
  if (platform.includes('linux')) return 'dolphin';
  return 'finder';
}

export const createLayoutSlice: StateCreator<AppStore, [], [], LayoutSlice> = (set, get) => ({
  activeShell: detectPlatformDefaultShell(),
  themeMode: 'system',
  showHiddenFiles: false,
  terminalOpen: false,
  terminalHeight: 300,
  terminalQueuedCommand: null,

  setShell: (shell) =>
    set((state) => ({
      activeShell: shell,
      tabs: state.tabs.map((tab) =>
        tab.id === state.activeTabId ? { ...tab, viewMode: DEFAULT_VIEW_MODE_BY_SHELL[shell] } : tab,
      ),
    })),

  cycleShell: () =>
    set((state) => {
      const currentIndex = SHELL_CYCLE_ORDER.indexOf(state.activeShell);
      const nextShell = SHELL_CYCLE_ORDER[(currentIndex + 1) % SHELL_CYCLE_ORDER.length];
      const resolvedShell = nextShell ?? 'finder';
      return {
        activeShell: resolvedShell,
        tabs: state.tabs.map((tab) =>
          tab.id === state.activeTabId ? { ...tab, viewMode: DEFAULT_VIEW_MODE_BY_SHELL[resolvedShell] } : tab,
        ),
      };
    }),

  setThemeMode: (mode) => set({ themeMode: mode }),

  toggleHiddenFiles: () => set((state) => ({ showHiddenFiles: !state.showHiddenFiles })),

  defaultViewModeForActiveShell: () => DEFAULT_VIEW_MODE_BY_SHELL[get().activeShell],

  setTerminalOpen: (open) => set({ terminalOpen: open }),

  toggleTerminal: () => set((state) => ({ terminalOpen: !state.terminalOpen })),

  setTerminalHeight: (height) => set({ terminalHeight: Math.max(150, Math.min(height, window.innerHeight - 200)) }),

  queueTerminalCommand: (cwd, command) =>
    set({
      terminalOpen: true,
      terminalQueuedCommand: { cwd, command, nonce: Date.now() },
    }),

  clearTerminalQueuedCommand: () => set({ terminalQueuedCommand: null }),

  // Annotation-Aware UI implementations
  pinnedFolders: [],
  pinFolder: (path) =>
    set((state) => {
      if (state.pinnedFolders.includes(path)) return {};
      return { pinnedFolders: [...state.pinnedFolders, path] };
    }),
  unpinFolder: (path) =>
    set((state) => ({
      pinnedFolders: state.pinnedFolders.filter((p) => p !== path),
    })),
  annotations: {},
  setAnnotations: (list) =>
    set(() => {
      const annotations: Record<string, DirectoryAnnotation> = {};
      for (const ann of list) {
        annotations[ann.path] = ann;
      }
      return { annotations };
    }),
  updateAnnotation: (ann) =>
    set((state) => ({
      annotations: { ...state.annotations, [ann.path]: ann },
      // Update detailsNode annotation if it's currently open
      detailsNode: state.detailsNode && state.detailsNode.path === ann.path 
        ? { ...state.detailsNode } 
        : state.detailsNode
    })),
  activeTagFilter: null,
  setActiveTagFilter: (tag) => set({ activeTagFilter: tag }),
  detailsNode: null,
  openDetails: (node) => set({ detailsNode: node }),
  closeDetails: () => set({ detailsNode: null }),
});
