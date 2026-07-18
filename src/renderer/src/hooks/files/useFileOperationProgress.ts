import { useState, useEffect } from 'react';
import { ipc } from '@renderer/services/ipc';
import type { FileOperationProgress } from '@shared/types/fileSystem';

export interface FileOpProgressItem extends FileOperationProgress {
  fileName: string;
}

export function useFileOperationProgress() {
  const [fileOpMap, setFileOpMap] = useState<Record<string, FileOpProgressItem>>({});

  useEffect(() => {
    return ipc.on('fs:operationProgress', (data) => {
      const fileName = data.currentPath.split('/').pop() || '';
      const item: FileOpProgressItem = { ...data, fileName };

      setFileOpMap((prev) => ({ ...prev, [data.operationId]: item }));

      if (data.done) {
        const timer = setTimeout(() => {
          setFileOpMap((prev) => {
            const next = { ...prev };
            delete next[data.operationId];
            return next;
          });
        }, 2500);
        return () => clearTimeout(timer);
      }
      return undefined;
    });
  }, []);

  const cancelFileOp = (operationId: string) => {
    void ipc.invoke('fs:cancel', { operationId });
    setFileOpMap((prev) => {
      const next = { ...prev };
      delete next[operationId];
      return next;
    });
  };

  return {
    fileOperations: Object.values(fileOpMap),
    cancelFileOp,
  };
}
