import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@renderer/store';
import { ipc } from '@renderer/services/ipc';
import type { SpaceAnalyzerNode, SpaceAnalyzerResult } from '@shared/types/spaceAnalyzer';

export interface UseSpaceAnalyzerResult {
  currentPath: string;
  viewedPath: string;
  isScanning: boolean;
  scanResult: SpaceAnalyzerNode | null;
  currentSubTree: SpaceAnalyzerNode | null;
  history: string[];
  viewMode: 'treemap' | 'donut' | 'list';
  hoveredPath: string | null;
  scanError: string | null;
  setHoveredPath: (path: string | null) => void;
  triggerScan: (targetPath?: string) => Promise<void>;
  cancelScan: () => Promise<void>;
  drillDown: (node: SpaceAnalyzerNode) => void;
  navigateUp: () => void;
  toggleViewMode: () => void;
  setViewMode: (mode: 'treemap' | 'donut' | 'list') => void;
  setCurrentPathInput: (path: string) => void;
  currentPathInput: string;
  browseFolder: () => Promise<void>;
  progress: {
    fileCount: number;
    size: number;
    scannedPath: string;
  };
  diskTotal: number;
  diskFree: number;
  selectedPath: string | null;
  setSelectedPath: (path: string | null) => void;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function findNodeByPath(node: SpaceAnalyzerNode, path: string): SpaceAnalyzerNode | null {
  if (node.path === path) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByPath(child, path);
      if (found) return found;
    }
  }
  return null;
}

export function useSpaceAnalyzer(): UseSpaceAnalyzerResult {
  const wellKnownDirs = useAppStore((state) => state.wellKnownDirs);
  const defaultPath = wellKnownDirs?.home ?? '/';

  const [currentPath, setCurrentPath] = useState<string>(defaultPath);
  const [currentPathInput, setCurrentPathInput] = useState<string>(defaultPath);
  const [viewedPath, setViewedPath] = useState<string>(defaultPath);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<SpaceAnalyzerNode | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'treemap' | 'donut' | 'list'>('treemap');
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Disk capacity states
  const [diskTotal, setDiskTotal] = useState<number>(0);
  const [diskFree, setDiskFree] = useState<number>(0);

  // Progress tracking states
  const [progressFileCount, setProgressFileCount] = useState<number>(0);
  const [progressSize, setProgressSize] = useState<number>(0);
  const [progressScannedPath, setProgressScannedPath] = useState<string>('');

  // Update default inputs when wellKnownDirs becomes available
  useEffect(() => {
    if (wellKnownDirs?.home && currentPath === '/') {
      setCurrentPath(wellKnownDirs.home);
      setCurrentPathInput(wellKnownDirs.home);
      setViewedPath(wellKnownDirs.home);
    }
  }, [wellKnownDirs, currentPath]);

  // IPC Event listener for live scan progress
  useEffect(() => {
    const unsubscribe = ipc.on('analyzer:progress', (event) => {
      setProgressFileCount(event.fileCount);
      setProgressSize(event.size);
      setProgressScannedPath(event.scannedPath);
    });
    return () => unsubscribe();
  }, []);

  const triggerScan = useCallback(async (targetPath?: string) => {
    const pathToScan = targetPath ?? currentPathInput;
    if (!pathToScan.trim()) return;

    setIsScanning(true);
    setScanError(null);
    setScanResult(null);
    setHistory([]);
    setSelectedPath(null);
    setProgressFileCount(0);
    setProgressSize(0);
    setProgressScannedPath(pathToScan);
    setDiskTotal(0);
    setDiskFree(0);

    try {
      const result: SpaceAnalyzerResult = await ipc.invoke('analyzer:scan', { path: pathToScan });
      setScanResult(result.rootNode);
      setDiskTotal(result.diskTotal);
      setDiskFree(result.diskFree);
      setCurrentPath(pathToScan);
      setCurrentPathInput(pathToScan);
      setViewedPath(pathToScan);
    } catch (err) {
      console.error('Space Analyzer scan failed:', err);
      setScanError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsScanning(false);
    }
  }, [currentPathInput]);

  const cancelScan = useCallback(async () => {
    try {
      await ipc.invoke('analyzer:cancel', undefined);
      setIsScanning(false);
      setScanError('Scan cancelled by user.');
    } catch (err) {
      console.error('Failed to cancel scan:', err);
    }
  }, []);

  const browseFolder = useCallback(async () => {
    try {
      const selected = await ipc.invoke('shell:selectFolder', { defaultPath: currentPathInput });
      if (selected) {
        setCurrentPathInput(selected);
      }
    } catch (err) {
      console.error('Failed to open directory selection dialog:', err);
    }
  }, [currentPathInput]);

  const drillDown = useCallback((node: SpaceAnalyzerNode) => {
    if (!node.isDirectory) return;
    setHistory((prev) => [...prev, viewedPath]);
    setViewedPath(node.path);
    setHoveredPath(null);
    setSelectedPath(null);
  }, [viewedPath]);

  const navigateUp = useCallback(() => {
    if (history.length === 0) return;
    const previousPath = history[history.length - 1]!;
    setHistory((prev) => prev.slice(0, -1));
    setViewedPath(previousPath);
    setHoveredPath(null);
    setSelectedPath(null);
  }, [history]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => {
      if (prev === 'treemap') return 'donut';
      if (prev === 'donut') return 'list';
      return 'treemap';
    });
  }, []);

  const currentSubTree = useMemo(() => {
    if (!scanResult) return null;
    return findNodeByPath(scanResult, viewedPath);
  }, [scanResult, viewedPath]);

  return {
    currentPath,
    viewedPath,
    isScanning,
    scanResult,
    currentSubTree,
    history,
    viewMode,
    hoveredPath,
    scanError,
    setHoveredPath,
    triggerScan,
    cancelScan,
    drillDown,
    navigateUp,
    toggleViewMode,
    setViewMode,
    setCurrentPathInput,
    currentPathInput,
    browseFolder,
    progress: {
      fileCount: progressFileCount,
      size: progressSize,
      scannedPath: progressScannedPath,
    },
    diskTotal,
    diskFree,
    selectedPath,
    setSelectedPath,
  };
}
