import { useMemo, useState } from 'react';
import { groupTimelineItems } from '@renderer/lib/fileTimelineUtils';
import { ipc } from '@renderer/services/ipc';
import { useAppStore } from '@renderer/store';
import type { FileTimelineScanResult } from '@shared/types/fileTimeline';

export function useFileTimeline(initialRootPath: string | null): {
  rootPath: string | null;
  days: number;
  result: FileTimelineScanResult | null;
  groups: ReturnType<typeof groupTimelineItems>;
  isLoading: boolean;
  error: string | null;
  setDays: (days: number) => void;
  scan: () => Promise<void>;
  chooseFolder: () => Promise<void>;
} {
  const wellKnownDirs = useAppStore((state) => state.wellKnownDirs);
  const showHiddenFiles = useAppStore((state) => state.showHiddenFiles);
  const [rootPath, setRootPath] = useState<string | null>(initialRootPath);
  const [days, setDays] = useState(7);
  const [result, setResult] = useState<FileTimelineScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groups = useMemo(() => groupTimelineItems(result?.items ?? []), [result]);

  const scan = async (): Promise<void> => {
    const scanRoot = rootPath ?? wellKnownDirs?.home;
    if (scanRoot === undefined) {
      setError('Choose a folder before scanning.');
      return;
    }

    setRootPath(scanRoot);
    setIsLoading(true);
    setError(null);
    try {
      const nextResult = await ipc.invoke('timeline:scan', {
        rootPath: scanRoot,
        includeHidden: showHiddenFiles,
        days,
        maxItems: 1500,
      });
      setResult(nextResult);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const chooseFolder = async (): Promise<void> => {
    const defaultPath = rootPath ?? wellKnownDirs?.home;
    const selected = await ipc.invoke('shell:selectFolder', defaultPath === undefined ? {} : { defaultPath });
    if (selected === null) return;
    setRootPath(selected);
    setResult(null);
    setError(null);
  };

  return {
    rootPath,
    days,
    result,
    groups,
    isLoading,
    error,
    setDays,
    scan,
    chooseFolder,
  };
}
