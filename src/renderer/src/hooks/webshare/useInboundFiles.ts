import { useCallback, useEffect, useState } from 'react';
import type { ReceivedFile } from '@shared/types/webShare';

interface MorphWindow {
  morph: {
    invoke: (channel: string, request?: unknown) => Promise<unknown>;
    on: (channel: string, listener: (payload: unknown) => void) => () => void;
  };
}

const getMorphApi = () => (window as unknown as MorphWindow).morph;

export function useInboundFiles() {
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);

  const fetchReceived = useCallback(async () => {
    try {
      const api = getMorphApi();
      const files = (await api.invoke('airshare:getReceived')) as ReceivedFile[];
      if (files) setReceivedFiles(files);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void fetchReceived();

    const api = getMorphApi();
    if (!api) return;

    const cleanup = api.on('webshare:updated', () => {
      void fetchReceived();
    });

    return cleanup;
  }, [fetchReceived]);

  const openReceivedFolder = useCallback(async () => {
    try {
      const api = getMorphApi();
      await api.invoke('airshare:openReceivedFolder');
    } catch {
      // ignore
    }
  }, []);

  return {
    receivedFiles,
    fetchReceived,
    openReceivedFolder,
  };
}
