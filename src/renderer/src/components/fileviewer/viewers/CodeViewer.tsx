import { Loader2 } from 'lucide-react';
import type { ViewerProps } from '../types';
import { useCodeViewer } from '@renderer/hooks';

export function CodeViewer({ filePath, node }: ViewerProps): React.JSX.Element {
  const { containerRef, isLoading, error, truncated } = useCodeViewer({
    filePath,
    extension: node.extension,
  });

  if (error !== null) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-current/60">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      {truncated ? (
        <div className="shrink-0 border-b border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-xs text-yellow-700 dark:text-yellow-400">
          File is too large to display completely. Showing the first 5 MB.
        </div>
      ) : null}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-current/40" />
        </div>
      ) : null}
      <div
        ref={containerRef}
        className="flex-1"
        style={{ visibility: isLoading ? 'hidden' : 'visible' }}
      />
    </div>
  );
}
