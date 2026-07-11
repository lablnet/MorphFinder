import { useCallback, useState } from 'react';
import { ipc } from '@renderer/services/ipc';
import { useAppStore } from '@renderer/store';

export function useDevPanelScanPath(): {
  scanPath: string;
  isPickingFolder: boolean;
  pickFolder: () => Promise<void>;
} {
  const activeTab = useAppStore((state) => state.activeTab());
  const wellKnownDirs = useAppStore((state) => state.wellKnownDirs);
  const lastRealPath =
    activeTab?.history.back
      .slice()
      .reverse()
      .find((path) => !path.startsWith('morph://')) ?? null;
  const defaultPath = lastRealPath ?? wellKnownDirs?.home ?? '/';
  const [overridePath, setOverridePath] = useState<string | null>(null);
  const [isPickingFolder, setIsPickingFolder] = useState(false);
  const scanPath = overridePath ?? defaultPath;

  const pickFolder = useCallback(async (): Promise<void> => {
    setIsPickingFolder(true);
    try {
      const selected = await ipc.invoke('shell:selectFolder', { defaultPath: scanPath });
      if (selected !== null) setOverridePath(selected);
    } finally {
      setIsPickingFolder(false);
    }
  }, [scanPath]);

  return { scanPath, isPickingFolder, pickFolder };
}
