import { useState, useEffect } from 'react';
import { ipc } from '@renderer/services/ipc';
import type { IpcEvents } from '@shared/ipc/contract';

export type ArchiveProgressPayload = IpcEvents['archive:progress'];

export interface ArchiveProgressItem extends ArchiveProgressPayload {
  fileName: string;
}

export function useArchiveProgress() {
  const [archiveMap, setArchiveMap] = useState<Record<string, ArchiveProgressItem>>({});

  useEffect(() => {
    return ipc.on('archive:progress', (data) => {
      const fileName = data.currentPath.split('/').pop() || 'Archive';
      const item: ArchiveProgressItem = { ...data, fileName };

      setArchiveMap((prev) => ({ ...prev, [data.operationId]: item }));

      if (data.done) {
        const timer = setTimeout(() => {
          setArchiveMap((prev) => {
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

  const cancelArchive = (operationId: string) => {
    void ipc.invoke('archive:cancel', { operationId });
    setArchiveMap((prev) => {
      const next = { ...prev };
      delete next[operationId];
      return next;
    });
  };

  return {
    archives: Object.values(archiveMap),
    cancelArchive,
  };
}
