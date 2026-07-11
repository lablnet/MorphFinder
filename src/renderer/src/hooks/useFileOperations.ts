import { useCallback, useEffect, useState } from 'react';
import { ipc } from '@renderer/services/ipc';
import type { FileOperationProgress, FileOperationRequest } from '@shared/types/fileSystem';

export interface UseFileOperationsResult {
  progress: FileOperationProgress | null;
  trash: (paths: string[]) => Promise<void>;
  copyTo: (sourcePaths: string[], destinationDir: string) => Promise<void>;
  moveTo: (sourcePaths: string[], destinationDir: string) => Promise<void>;
}

export function useFileOperations(): UseFileOperationsResult {
  const [progress, setProgress] = useState<FileOperationProgress | null>(null);
  const [activeOperationId, setActiveOperationId] = useState<string | null>(null);

  useEffect(
    () =>
      ipc.on('fs:operationProgress', (event) => {
        if (activeOperationId === null || event.operationId === activeOperationId) setProgress(event);
      }),
    [activeOperationId],
  );

  const start = useCallback(async (kind: 'copy' | 'move' | 'trash', sourcePaths: string[], destinationDir?: string) => {
    if (sourcePaths.length === 0) return;
    const request: FileOperationRequest =
      destinationDir === undefined ? { kind, sourcePaths } : { kind, sourcePaths, destinationDir };
    const { operationId } = await ipc.invoke('fs:operate', request);
    setActiveOperationId(operationId);
    setProgress({ operationId, completed: 0, total: sourcePaths.length, currentPath: sourcePaths[0] ?? '', done: false });
  }, []);

  return {
    progress,
    trash: (paths) => start('trash', paths),
    copyTo: (sourcePaths, destinationDir) => start('copy', sourcePaths, destinationDir),
    moveTo: (sourcePaths, destinationDir) => start('move', sourcePaths, destinationDir),
  };
}
