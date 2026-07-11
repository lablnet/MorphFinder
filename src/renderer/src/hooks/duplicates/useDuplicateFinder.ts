import { useEffect, useMemo, useRef, useState } from 'react';
import { duplicateRoots, type DuplicateScanScope } from '@renderer/lib/duplicateFinderUtils';
import { ipc } from '@renderer/services/ipc';
import { useAppStore } from '@renderer/store';
import type { DuplicateGroup } from '@shared/types/duplicates';

export type { DuplicateScanScope } from '@renderer/lib/duplicateFinderUtils';

export interface DuplicateProgressState {
  phase: 'scanning' | 'hashing';
  scannedCount: number;
  hashedCount: number;
  groupsFound: number;
  currentPath: string;
  groups: DuplicateGroup[];
}

export interface DuplicateScanMeta {
  scannedCount: number;
  hashedCount: number;
  truncated: boolean;
}

export function useDuplicateFinder(): {
  groups: DuplicateGroup[];
  selectedPaths: Set<string>;
  selectedBytes: number;
  scanning: boolean;
  cleaning: boolean;
  scanScope: DuplicateScanScope;
  customFolder: string | null;
  message: string | null;
  scanMeta: DuplicateScanMeta | null;
  progress: DuplicateProgressState | null;
  setScanScope: (scope: DuplicateScanScope) => void;
  scan: () => Promise<void>;
  stopScan: () => Promise<void>;
  chooseFolder: () => Promise<void>;
  keepNewest: () => void;
  togglePath: (path: string) => void;
  trashSelected: () => Promise<void>;
} {
  const wellKnownDirs = useAppStore((state) => state.wellKnownDirs);
  const showHiddenFiles = useAppStore((state) => state.showHiddenFiles);
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [scanScope, setScanScope] = useState<DuplicateScanScope>('workspaces');
  const [customFolder, setCustomFolder] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [scanMeta, setScanMeta] = useState<DuplicateScanMeta | null>(null);
  const [progress, setProgress] = useState<DuplicateProgressState | null>(null);
  const scanGeneration = useRef(0);
  const acceptingProgress = useRef(false);

  const selectedBytes = useMemo(() => {
    let total = 0;
    for (const group of groups) {
      for (const file of group.files) {
        if (selectedPaths.has(file.path)) total += file.sizeInBytes;
      }
    }
    return total;
  }, [groups, selectedPaths]);

  const scan = async (): Promise<void> => {
    const roots = duplicateRoots(wellKnownDirs, scanScope, customFolder);
    if (roots.length === 0) {
      setMessage(scanScope === 'custom' ? 'Choose a folder before scanning.' : null);
      return;
    }

    const generation = scanGeneration.current + 1;
    scanGeneration.current = generation;
    acceptingProgress.current = true;
    setScanning(true);
    setMessage(null);
    setSelectedPaths(new Set());
    setProgress({ phase: 'scanning', scannedCount: 0, hashedCount: 0, groupsFound: 0, currentPath: '', groups: [] });

    try {
      const result = await ipc.invoke('duplicates:scan', {
        roots,
        includeHidden: showHiddenFiles,
        minSizeBytes: 1024,
        scope: scanScope === 'custom' ? 'workspaces' : scanScope,
      });
      if (scanGeneration.current !== generation) return;
      setGroups(result.groups);
      setScanMeta({
        scannedCount: result.scannedCount,
        hashedCount: result.hashedCount,
        truncated: result.truncated,
      });
    } catch (cause) {
      if (scanGeneration.current !== generation) return;
      setMessage(cause instanceof Error ? cause.message : String(cause));
      setGroups([]);
      setScanMeta(null);
    } finally {
      if (scanGeneration.current === generation) {
        acceptingProgress.current = false;
        setScanning(false);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = ipc.on('duplicates:progress', (nextProgress) => {
      if (!acceptingProgress.current) return;
      setProgress(nextProgress);
      if (nextProgress.groups.length > 0) setGroups(nextProgress.groups);
      setScanMeta({
        scannedCount: nextProgress.scannedCount,
        hashedCount: nextProgress.hashedCount,
        truncated: false,
      });
    });
    return unsubscribe;
  }, []);

  const stopScan = async (): Promise<void> => {
    scanGeneration.current += 1;
    acceptingProgress.current = false;
    setScanning(false);
    setMessage('Duplicate scan stopped.');
    void ipc.invoke('duplicates:cancel', undefined);
  };

  const chooseFolder = async (): Promise<void> => {
    const defaultPath = customFolder ?? wellKnownDirs?.downloads;
    const selected = await ipc.invoke('shell:selectFolder', defaultPath === undefined ? {} : { defaultPath });
    if (selected === null) return;
    setCustomFolder(selected);
    setScanScope('custom');
    setMessage(null);
  };

  const keepNewest = (): void => {
    const next = new Set<string>();
    for (const group of groups) {
      const sorted = [...group.files].sort((left, right) => right.modifiedAt - left.modifiedAt);
      sorted.slice(1).forEach((file) => next.add(file.path));
    }
    setSelectedPaths(next);
  };

  const togglePath = (path: string): void => {
    setSelectedPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const trashSelected = async (): Promise<void> => {
    if (selectedPaths.size === 0) return;
    setCleaning(true);
    setMessage(null);
    try {
      await ipc.invoke('shell:trash', { paths: [...selectedPaths] });
      setMessage(`Moved ${selectedPaths.size} duplicate file${selectedPaths.size === 1 ? '' : 's'} to Trash.`);
      await scan();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setCleaning(false);
    }
  };

  return {
    groups,
    selectedPaths,
    selectedBytes,
    scanning,
    cleaning,
    scanScope,
    customFolder,
    message,
    scanMeta,
    progress,
    setScanScope,
    scan,
    stopScan,
    chooseFolder,
    keepNewest,
    togglePath,
    trashSelected,
  };
}
