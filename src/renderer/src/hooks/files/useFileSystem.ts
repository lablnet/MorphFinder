import { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@renderer/store';
import { ipc } from '@renderer/services/ipc';
import type { FileSystemNode } from '@shared/types/fileSystem';
import {
  THIS_PC_PATH,
  CACHE_CLEANER_PATH,
  SPACE_ANALYZER_PATH,
  DEV_PANEL_PATH,
  DUPLICATE_FINDER_PATH,
  SMART_COLLECTIONS_PATH,
  smartCollectionPath,
} from '@shared/constants';
import { SMART_COLLECTIONS, type SmartCollectionId } from '@shared/types/smartCollections';
import { classifyFileSystemError, type FileSystemErrorKind } from '@renderer/lib/fileSystemError';

export interface UseFileSystemResult {
  nodes: FileSystemNode[];
  isLoading: boolean;
  error: string | null;
  errorKind: FileSystemErrorKind | null;
  hasPartialResults: boolean;
  navigate: (path: string) => void;
  openNode: (node: FileSystemNode) => void;
  refresh: () => void;
  /** The file currently open in the in-app viewer, or null. */
  fileViewerTarget: FileSystemNode | null;
  closeFileViewer: () => void;
}

function virtualDirectory(name: string, path: string): FileSystemNode {
  return {
    path,
    name,
    kind: 'directory',
    sizeInBytes: 0,
    modifiedAt: Date.now(),
    createdAt: Date.now(),
    isHidden: false,
    extension: '',
  };
}

function createThisPcNodes(wellKnownDirs: { home: string; desktop: string; documents: string; downloads: string } | null): FileSystemNode[] {
  if (wellKnownDirs === null) return [];

  return [
    virtualDirectory('Desktop', wellKnownDirs.desktop),
    virtualDirectory('Documents', wellKnownDirs.documents),
    virtualDirectory('Downloads', wellKnownDirs.downloads),
    virtualDirectory('Home', wellKnownDirs.home),
    virtualDirectory('Local Disk', '/'),
  ];
}

function createSmartCollectionNodes(): FileSystemNode[] {
  return SMART_COLLECTIONS.map((collection) => virtualDirectory(
    collection.label,
    collection.id === 'duplicates' ? DUPLICATE_FINDER_PATH : smartCollectionPath(collection.id),
  ));
}

function smartCollectionIdFromPath(path: string): SmartCollectionId | null {
  if (!path.startsWith(`${SMART_COLLECTIONS_PATH}/`)) return null;
  const id = path.slice(SMART_COLLECTIONS_PATH.length + 1);
  return SMART_COLLECTIONS.some((collection) => collection.id === id) ? id as SmartCollectionId : null;
}

function normalizeVirtualPath(path: string): string {
  if (path.startsWith('/morph:/')) return path.replace('/morph:/', 'morph://');
  return path;
}

function isSmartCollectionPath(path: string): boolean {
  return path === SMART_COLLECTIONS_PATH || smartCollectionIdFromPath(path) !== null;
}

function smartCollectionRoots(
  id: SmartCollectionId,
  wellKnownDirs: { home: string; desktop: string; documents: string; downloads: string } | null,
): string[] {
  if (wellKnownDirs === null) return [];
  if (id === 'old-downloads') return [wellKnownDirs.downloads];
  return [
    wellKnownDirs.desktop,
    wellKnownDirs.documents,
    wellKnownDirs.downloads,
    `${wellKnownDirs.home}/projects`,
    `${wellKnownDirs.home}/Developer`,
    `${wellKnownDirs.home}/Code`,
    `${wellKnownDirs.home}/Workspace`,
  ];
}

/**
 * Everything the explorer view knows about the current directory lives here, so the
 * page component consuming it stays 100% logicless. Listings are hook-local state
 * (ephemeral, re-fetched on navigate/watch) rather than store state — see
 * store/index.ts for why only durable app state lives in Zustand.
 */
export function useFileSystem(): UseFileSystemResult {
  const { path, showHidden, navigateActiveTab, wellKnownDirs } = useAppStore(
    useShallow((state) => ({
      path: state.activeTab()?.path ?? null,
      showHidden: state.showHiddenFiles,
      navigateActiveTab: state.navigateActiveTab,
      wellKnownDirs: state.wellKnownDirs,
    })),
  );

  const [nodes, setNodes] = useState<FileSystemNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPartialResults, setHasPartialResults] = useState(false);
  const [fileViewerTarget, setFileViewerTarget] = useState<FileSystemNode | null>(null);
  const loadRequestId = useRef(0);
  const errorKind = error === null ? null : classifyFileSystemError(error);

  const load = useCallback(async () => {
    if (path === null) return;
    const requestId = loadRequestId.current + 1;
    loadRequestId.current = requestId;
    const isCurrentRequest = (): boolean => loadRequestId.current === requestId;
    const normalizedPath = normalizeVirtualPath(path);
    if (normalizedPath !== path) {
      navigateActiveTab(normalizedPath);
      return;
    }
    setIsLoading(true);
    setError(null);
    if (isSmartCollectionPath(path)) {
      setNodes([]);
      setHasPartialResults(false);
    }
    try {
      if (path === THIS_PC_PATH) {
        if (!isCurrentRequest()) return;
        setNodes(createThisPcNodes(wellKnownDirs));
        setHasPartialResults(false);
        return;
      }
      if (path === CACHE_CLEANER_PATH) {
        if (!isCurrentRequest()) return;
        setNodes([]);
        setHasPartialResults(false);
        return;
      }
      if (path === SPACE_ANALYZER_PATH) {
        if (!isCurrentRequest()) return;
        setNodes([]);
        setHasPartialResults(false);
        return;
      }
      if (path === DEV_PANEL_PATH) {
        if (!isCurrentRequest()) return;
        setNodes([]);
        setHasPartialResults(false);
        return;
      }
      if (path === DUPLICATE_FINDER_PATH) {
        if (!isCurrentRequest()) return;
        setNodes([]);
        setHasPartialResults(false);
        return;
      }
      if (path === SMART_COLLECTIONS_PATH) {
        if (!isCurrentRequest()) return;
        setNodes(createSmartCollectionNodes());
        setHasPartialResults(false);
        return;
      }
      const smartCollectionId = smartCollectionIdFromPath(path);
      if (smartCollectionId !== null) {
        const roots = smartCollectionRoots(smartCollectionId, wellKnownDirs);
        if (roots.length === 0) {
          if (!isCurrentRequest()) return;
          setNodes([]);
          setHasPartialResults(false);
          return;
        }
        const result = await ipc.invoke('smartCollections:scan', {
          id: smartCollectionId,
          roots,
          includeHidden: showHidden,
        });
        if (!isCurrentRequest()) return;
        setNodes(result.nodes);
        setHasPartialResults(result.truncated);
        return;
      }
      const listing = await ipc.invoke('fs:readDirectory', { path, includeHidden: showHidden });
      if (!isCurrentRequest()) return;
      setNodes(listing.nodes);
      setHasPartialResults(listing.hasPartialResults);
    } catch (cause) {
      if (!isCurrentRequest()) return;
      setNodes([]);
      setHasPartialResults(false);
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      if (isCurrentRequest()) setIsLoading(false);
    }
  }, [path, showHidden, wellKnownDirs]);

  // Load on navigate, keep watching the active directory, and refresh whenever the
  // main process reports a change — this is what keeps the view live without polling.
  useEffect(() => {
    if (path === null) return;

    void load();
    if (
      path === THIS_PC_PATH ||
      path === CACHE_CLEANER_PATH ||
      path === SPACE_ANALYZER_PATH ||
      path === DEV_PANEL_PATH ||
      path === DUPLICATE_FINDER_PATH ||
      isSmartCollectionPath(path)
    ) return;
    void ipc.invoke('fs:watch', { path });

    const unsubscribe = ipc.on('fs:changed', (event) => {
      if (event.path === path) void load();
    });

    return () => {
      unsubscribe();
      void ipc.invoke('fs:unwatch', { path });
    };
  }, [path, load]);

  const openNode = useCallback(
    (node: FileSystemNode) => {
      if (node.kind === 'directory') navigateActiveTab(node.path);
      else setFileViewerTarget(node);
    },
    [navigateActiveTab],
  );

  const closeFileViewer = useCallback(() => {
    setFileViewerTarget(null);
  }, []);

  return {
    nodes,
    isLoading,
    error,
    errorKind,
    hasPartialResults,
    navigate: navigateActiveTab,
    openNode,
    refresh: () => void load(),
    fileViewerTarget,
    closeFileViewer,
  };
}
