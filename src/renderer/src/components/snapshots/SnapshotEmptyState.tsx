import { Camera, Sparkles } from 'lucide-react';
import { Button } from '@lablnet/ui';

interface SnapshotEmptyStateProps {
  onSaveCurrent: () => void;
}

export function SnapshotEmptyState({ onSaveCurrent }: SnapshotEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/30">
      <div className="flex size-12 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400">
        <Camera className="size-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        No Workspace Snapshots
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Freeze your active tabs, folder layouts, and shell view into a snapshot to restore anytime.
      </p>
      <Button
        className="mt-5 gap-2"
        onClick={onSaveCurrent}
        size="sm"
      >
        <Sparkles className="size-4" />
        Freeze Current Session
      </Button>
    </div>
  );
}
