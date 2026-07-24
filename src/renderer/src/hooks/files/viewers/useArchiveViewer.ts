import { useState, useEffect } from 'react';
import { ipc } from '@renderer/services/ipc';
import type { FileSystemNode } from '@shared/types/fileSystem';

export interface ArchiveEntryItem {
  name: string;
  size: number;
  isDirectory: boolean;
}

export function useArchiveViewer(node: FileSystemNode) {
  const [entries, setEntries] = useState<ArchiveEntryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadArchiveEntries() {
      setLoading(true);
      try {
        const res = await ipc.invoke('archive:list', { archivePath: node.path });
        if (!isMounted) return;

        if (res.entries && res.entries.length > 0) {
          setEntries(
            res.entries.map((e) => ({
              name: e.name,
              size: 0,
              isDirectory: e.isDirectory,
            }))
          );
        } else {
          setEntries([{ name: node.name, size: node.sizeInBytes, isDirectory: true }]);
        }
      } catch {
        if (isMounted) {
          setEntries([{ name: node.name, size: node.sizeInBytes, isDirectory: true }]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadArchiveEntries();
    return () => {
      isMounted = false;
    };
  }, [node.path, node.name, node.sizeInBytes]);

  const handleExtract = async () => {
    setExtracting(true);
    setStatusMessage('Extracting archive...');
    try {
      const res = await ipc.invoke('archive:extract', { archivePath: node.path });
      setStatusMessage(`Extracted to: ${res.extractedDir}`);
    } catch (err) {
      setStatusMessage(`Extraction failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExtracting(false);
    }
  };

  return {
    entries,
    loading,
    extracting,
    statusMessage,
    handleExtract,
  };
}
