import { useEffect, useState } from 'react';
import { ipc } from '@renderer/services/ipc';

interface UseTextViewerOptions {
  filePath: string;
}

export function useTextViewer({ filePath }: UseTextViewerOptions) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ipc.invoke('fs:readFile', { path: filePath })
      .then((result) => {
        if (cancelled) return;
        if (result.encoding !== 'utf-8') {
          setError('This file appears to be binary and cannot be displayed as text.');
          return;
        }
        setContent(result.content);
        setTruncated(result.truncated);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
      });
    return () => { cancelled = true; };
  }, [filePath]);

  return {
    content,
    error,
    truncated,
  };
}
