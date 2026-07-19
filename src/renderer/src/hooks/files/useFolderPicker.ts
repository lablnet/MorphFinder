import { useCallback, useEffect, useMemo, useState } from 'react';
import { ipc } from '@renderer/services/ipc';
import { useAppStore } from '@renderer/store';
import type { FileSystemNode } from '@shared/types/fileSystem';

export type FolderPickerViewMode = 'grid' | 'list';

export interface FolderPickerQuickFolder {
  label: string;
  path: string;
}

function isVirtualPath(path: string): boolean {
  return path.startsWith('morph://');
}

function sortNodes(left: FileSystemNode, right: FileSystemNode): number {
  if (left.kind === 'directory' && right.kind !== 'directory') return -1;
  if (left.kind !== 'directory' && right.kind === 'directory') return 1;
  return left.name.localeCompare(right.name);
}

export function parentFolderPath(path: string): string {
  if (path === '/' || /^[a-zA-Z]:\\?$/.test(path)) return path;
  const normalized = path.replace(/[/\\]+$/, '');
  const separator = normalized.includes('\\') ? '\\' : '/';
  const index = normalized.lastIndexOf(separator);
  if (index <= 0) return separator === '\\' ? normalized : '/';
  return normalized.slice(0, index);
}

export function useFolderPicker(initialPath?: string | null): {
  activeShell: string;
  currentPath: string;
  pathInput: string;
  sortedNodes: FileSystemNode[];
  directoryCount: number;
  fileCount: number;
  isLoading: boolean;
  error: string | null;
  viewMode: FolderPickerViewMode;
  quickFolders: FolderPickerQuickFolder[];
  loadPath: (path: string) => Promise<void>;
  setPathInput: (path: string) => void;
  setPathInputFocused: (focused: boolean) => void;
  setViewMode: (mode: FolderPickerViewMode) => void;
} {
  const activeShell = useAppStore((state) => state.activeShell);
  const showHiddenFiles = useAppStore((state) => state.showHiddenFiles);
  const wellKnownDirs = useAppStore((state) => state.wellKnownDirs);
  const startPath = initialPath !== null && initialPath !== undefined && !isVirtualPath(initialPath)
    ? initialPath
    : wellKnownDirs?.home ?? '/';
  const [currentPath, setCurrentPath] = useState(startPath);
  const [pathInput, setPathInput] = useState(startPath);
  const [nodes, setNodes] = useState<FileSystemNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<FolderPickerViewMode>('grid');
  const [isPathInputFocused, setPathInputFocused] = useState(false);

  const sortedNodes = useMemo(() => [...nodes].sort(sortNodes), [nodes]);
  const directoryCount = sortedNodes.filter((node) => node.kind === 'directory').length;
  const fileCount = sortedNodes.length - directoryCount;

  const loadPath = useCallback(async (path: string) => {
    if (!path.trim() || isVirtualPath(path)) return;
    setIsLoading(true);
    setError(null);
    try {
      const listing = await ipc.invoke('fs:readDirectory', { path, includeHidden: showHiddenFiles });
      setCurrentPath(listing.path);
      setPathInput(listing.path);
      setNodes(listing.nodes);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setNodes([]);
    } finally {
      setIsLoading(false);
    }
  }, [showHiddenFiles]);

  useEffect(() => {
    void loadPath(startPath);
  }, [loadPath, startPath]);

  useEffect(() => {
    const nextPath = pathInput.trim();
    if (!isPathInputFocused || !nextPath || nextPath === currentPath || isVirtualPath(nextPath)) return;

    const timeoutId = window.setTimeout(() => {
      void loadPath(nextPath);
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [currentPath, isPathInputFocused, loadPath, pathInput]);

  const quickFolders = wellKnownDirs === null ? [] : [
    { label: 'Home', path: wellKnownDirs.home },
    { label: 'Desktop', path: wellKnownDirs.desktop },
    { label: 'Documents', path: wellKnownDirs.documents },
    { label: 'Downloads', path: wellKnownDirs.downloads },
  ];

  return {
    activeShell,
    currentPath,
    pathInput,
    sortedNodes,
    directoryCount,
    fileCount,
    isLoading,
    error,
    viewMode,
    quickFolders,
    loadPath,
    setPathInput,
    setPathInputFocused,
    setViewMode,
  };
}
