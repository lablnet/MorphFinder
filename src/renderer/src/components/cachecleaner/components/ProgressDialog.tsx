import React from 'react';
import { Loader2 } from 'lucide-react';
import { formatBytes, type ProgressState } from '../../../hooks/files/useCacheCleaner';
import { BaseDialog } from '../../ui/BaseDialog';

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
  const shell = activeShell === 'explorer' || activeShell === 'dolphin' ? activeShell : 'finder';

  const progressBarClass = {
    explorer: 'w-full bg-shell-sidebar h-5 border border-shell-border rounded-none overflow-hidden relative',
    dolphin: 'w-full bg-shell-sidebar h-4 rounded-shell overflow-hidden relative',
    finder: 'w-full bg-black/5 dark:bg-white/10 h-2.5 rounded-full overflow-hidden relative',
  }[shell];

  const progressFillClass = {
    explorer: 'bg-[#0067c0] h-full transition-all duration-150',
    dolphin: 'bg-[color:var(--shell-accent)] h-full transition-all duration-150',
    finder: 'bg-blue-500 h-full transition-all duration-150 rounded-full',
  }[shell];

  if (!cleaning) return null;

  // Prevent NaN or Division by zero
  const total = progressState.total || 1;
  const current = progressState.current;
  const percentage = Math.round((current / total) * 100);

  return (
    <BaseDialog activeShell={activeShell} size="sm">
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
        <div className={progressBarClass}>
          <div 
            className={progressFillClass} 
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
    </BaseDialog>
  );
}

