import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@renderer/store';
import { ipc } from '@renderer/services/ipc';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { THIS_PC_PATH } from '@shared/constants';
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
  const errorKind = error === null ? null : classifyFileSystemError(error);

  const load = useCallback(async () => {
    if (path === null) return;
    setIsLoading(true);
    setError(null);
    try {
      if (path === THIS_PC_PATH) {
        setNodes(createThisPcNodes(wellKnownDirs));
        setHasPartialResults(false);
        return;
      }
      const listing = await ipc.invoke('fs:readDirectory', { path, includeHidden: showHidden });
      setNodes(listing.nodes);
      setHasPartialResults(listing.hasPartialResults);
    } catch (cause) {
      setNodes([]);
      setHasPartialResults(false);
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setIsLoading(false);
    }
  }, [path, showHidden, wellKnownDirs]);

  // Load on navigate, keep watching the active directory, and refresh whenever the
  // main process reports a change — this is what keeps the view live without polling.
  useEffect(() => {
    if (path === null) return;

    void load();
    if (path === THIS_PC_PATH) return;
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
