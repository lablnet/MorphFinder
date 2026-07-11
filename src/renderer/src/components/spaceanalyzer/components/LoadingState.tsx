import React from 'react';
import { Loader2 } from 'lucide-react';
import { formatBytes } from '@renderer/lib/format';

interface LoadingStateProps {
  progress: {
    fileCount: number;
    size: number;
    scannedPath: string;
  };
}

export function LoadingState({ progress }: LoadingStateProps): React.JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 bg-shell-surface/60 text-current/80 p-6">
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-shell-accent" />
        <div className="absolute h-6 w-6 rounded-full bg-shell-accent/20 animate-ping" />
      </div>

      <div className="text-center space-y-3 max-w-md w-full">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-wide select-none">
            Scanning Storage...
          </h3>
          <p className="text-[11px] text-current/50 select-none">
            Computing subdirectory weights and counting files.
          </p>
        </div>

        {/* Real-time progress card */}
        <div className="bg-shell-sidebar/50 border border-shell-border/40 p-3 rounded-lg flex flex-col gap-2 text-left font-mono select-none shadow-sm">
          <div className="flex items-center justify-between text-[10px] text-current/55">
            <span>Files Counted:</span>
            <span className="font-semibold text-current/80">{progress.fileCount}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-current/55">
            <span>Total Weight:</span>
            <span className="font-semibold text-current/80">{formatBytes(progress.size)}</span>
          </div>
          {progress.scannedPath && (
            <div className="border-t border-shell-border/30 pt-1.5 mt-0.5 text-[9px] text-current/40 truncate w-full">
              <span className="font-semibold uppercase tracking-wider text-current/35 mr-1 block text-[8px]">
                Active Folder:
              </span>
              <span className="truncate block font-mono">{progress.scannedPath}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
