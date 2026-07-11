import { useEffect, useState } from 'react';
import { ipc } from '@renderer/services/ipc';

interface UseMarkdownViewerOptions {
  filePath: string;
}

export function useMarkdownViewer({ filePath }: UseMarkdownViewerOptions) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ipc.invoke('fs:readFile', { path: filePath })
      .then((result) => {
        if (cancelled) return;
        if (result.encoding !== 'utf-8') {
          setError('Could not read this file as text.');
          return;
        }
        setContent(result.content);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
      });
    return () => { cancelled = true; };
  }, [filePath]);

  return {
    content,
    error,
  };
}
