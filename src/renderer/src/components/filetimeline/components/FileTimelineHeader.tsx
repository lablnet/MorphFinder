import { Clock3, FolderOpen, RefreshCw } from 'lucide-react';
import { Button } from '@renderer/components/ui/Button';

export function FileTimelineHeader({
  rootPath,
  isLoading,
  onChooseFolder,
  onScan,
}: {
  rootPath: string | null;
  isLoading: boolean;
  onChooseFolder: () => void;
  onScan: () => void;
}): React.JSX.Element {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-shell-border bg-shell-surface/60 p-4 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-shell bg-shell-accent/10 text-shell-accent">
          <Clock3 size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-current">File Timeline</h2>
          <p className="truncate text-xs text-current/50">{rootPath ?? 'Choose a folder to see recent file activity.'}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button onClick={onChooseFolder} disabled={isLoading} variant="outline" className="gap-2">
          <FolderOpen size={14} />
          Folder
        </Button>
        <Button onClick={onScan} disabled={isLoading} variant="accent" className="gap-2">
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Scan
        </Button>
      </div>
    </div>
  );
}
