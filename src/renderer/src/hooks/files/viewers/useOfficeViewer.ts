import { useState, useEffect } from 'react';
import { ipc } from '@renderer/services/ipc';

const SPREADSHEET_EXTS = new Set(['xls', 'xlsx', 'ods', 'numbers', 'csv', 'tsv']);

export function useOfficeViewer(filePath: string, extension: string) {
  const isSpreadsheet = SPREADSHEET_EXTS.has(extension.toLowerCase());
  const [tableData, setTableData] = useState<string[][]>([]);
  const [docText, setDocText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadOfficePreview() {
      setLoading(true);
      try {
        const res = await ipc.invoke('fs:readFile', { path: filePath, maxBytes: 512 * 1024 });
        if (!isMounted) return;

        if (res.content && res.encoding === 'utf-8') {
          if (extension.toLowerCase() === 'csv' || extension.toLowerCase() === 'tsv') {
            const lines = res.content.split('\n').filter((l) => l.trim().length > 0).slice(0, 100);
            const rows = lines.map((line) => line.split(/,|\t/));
            setTableData(rows);
          } else {
            const text = res.content
              .replace(/<[^>]+>/g, ' ')
              .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            if (text.length > 20) {
              setDocText(text.slice(0, 5000));
            }
          }
        }
      } catch {
        // Fallback to metadata view
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadOfficePreview();
    return () => {
      isMounted = false;
    };
  }, [filePath, extension]);

  return {
    isSpreadsheet,
    tableData,
    docText,
    loading,
  };
}
