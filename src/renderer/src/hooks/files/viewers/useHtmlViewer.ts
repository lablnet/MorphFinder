import { useState, useEffect } from 'react';
import { ipc } from '@renderer/services/ipc';

export function useHtmlViewer(filePath: string) {
  const [content, setContent] = useState<string>('');
  const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadHtmlContent() {
      setLoading(true);
      try {
        const res = await ipc.invoke('fs:readFile', { path: filePath, maxBytes: 1024 * 1024 });
        if (isMounted) {
          setContent(res.content || '');
        }
      } catch {
        if (isMounted) {
          setContent('<!-- Failed to load HTML content -->');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadHtmlContent();
    return () => {
      isMounted = false;
    };
  }, [filePath]);

  return {
    content,
    viewMode,
    setViewMode,
    loading,
  };
}
