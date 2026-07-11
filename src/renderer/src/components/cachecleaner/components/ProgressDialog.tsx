import React from 'react';
import { Loader2 } from 'lucide-react';
import { formatBytes, type ProgressState } from '../../../hooks/files/useCacheCleaner';

interface ProgressDialogProps {
  activeShell: string;
  cleaning: boolean;
  progressState: ProgressState;
}

export function ProgressDialog({
  activeShell,
  cleaning,
  progressState,
}: ProgressDialogProps): React.JSX.Element | null {
  // Determine OS layout style
  const getDialogStyle = () => {
    switch (activeShell) {
      case 'explorer':
        return {
          overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity',
          content: 'w-full max-w-sm rounded-none border-2 border-[#0067c0] dark:border-[#4cc2ff] bg-shell-surface p-5 shadow-2xl flex flex-col font-sans text-current',
          contentStyle: undefined,
          progressBar: 'w-full bg-shell-sidebar h-5 border border-shell-border rounded-none overflow-hidden relative',
          progressFill: 'bg-[#0067c0] h-full transition-all duration-150'
        };
      case 'dolphin':
        return {
          overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity',
          content: 'w-full max-w-sm rounded-shell border border-shell-border bg-shell-surface p-5 shadow-xl flex flex-col text-current',
          contentStyle: undefined,
          progressBar: 'w-full bg-shell-sidebar h-4 rounded-shell overflow-hidden relative',
          progressFill: 'bg-[color:var(--shell-accent)] h-full transition-all duration-150'
        };
      default: // finder / mac
        return {
          overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity',
          content: 'w-full max-w-xs rounded-2xl border border-shell-border shadow-2xl flex flex-col p-5 backdrop-blur-xl text-current',
          contentStyle: { 
            backgroundColor: 'color-mix(in srgb, var(--shell-surface) 92%, transparent)', 
            color: 'currentColor' 
          },
          progressBar: 'w-full bg-black/5 dark:bg-white/10 h-2.5 rounded-full overflow-hidden relative',
          progressFill: 'bg-blue-500 h-full transition-all duration-150 rounded-full'
        };
    }
  };

  const ds = getDialogStyle();

  if (!cleaning) return null;

  // Prevent NaN or Division by zero
  const total = progressState.total || 1;
  const current = progressState.current;
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={ds.overlay}>
      <div className={ds.content} style={ds.contentStyle}>
        <div className="flex items-center gap-3 mb-4 text-shell-accent shrink-0">
          <Loader2 className="animate-spin text-shell-accent shrink-0" size={activeShell === 'explorer' ? 20 : 24} />
          <h3 className={activeShell === 'finder' ? 'text-sm font-semibold tracking-tight text-center w-full' : 'text-sm font-semibold'}>
            Cleaning Caches
          </h3>
        </div>
        
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between text-current/60">
            <span className="truncate max-w-[220px]">
              Deleting {progressState.currentTargetName || 'folders'}
            </span>
            <span className="shrink-0 font-mono">
              {percentage}% ({current} of {total})
            </span>
          </div>
          
          {/* Progress bar matching shell design tokens */}
          <div className={ds.progressBar}>
            <div 
              className={ds.progressFill} 
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-current/40 pt-1">
            <span>Space reclaimed:</span>
            <span className="font-mono text-shell-accent font-semibold">
              {formatBytes(progressState.freedBytes)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
