import { CheckSquare, Copy, RefreshCw, StopCircle, Trash2 } from 'lucide-react';
import { Button } from '@renderer/components/ui/Button';
import { formatBytes } from '@renderer/lib/format';

export function DuplicateFinderHeader({
  scanning,
  cleaning,
  groupsCount,
  selectedCount,
  selectedBytes,
  onScan,
  onStop,
  onKeepNewest,
  onTrashSelected,
}: {
  scanning: boolean;
  cleaning: boolean;
  groupsCount: number;
  selectedCount: number;
  selectedBytes: number;
  onScan: () => void;
  onStop: () => void;
  onKeepNewest: () => void;
  onTrashSelected: () => void;
}): React.JSX.Element {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-shell-border bg-shell-surface/60 p-4 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-shell bg-shell-accent/10 text-shell-accent">
          <Copy size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-current">Duplicate Finder</h2>
          <p className="truncate text-xs text-current/50">Exact duplicates: size match first, then SHA-256 hash verification.</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button onClick={onScan} disabled={scanning || cleaning} variant="ghost" size="icon" title="Scan">
          <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
        </Button>
        <Button onClick={onStop} disabled={!scanning} variant="outline" className="gap-2">
          <StopCircle size={14} />
          Stop
        </Button>
        <Button onClick={onKeepNewest} disabled={groupsCount === 0 || scanning || cleaning} variant="outline" className="gap-2">
          <CheckSquare size={14} />
          Keep Newest
        </Button>
        <Button onClick={onTrashSelected} disabled={selectedCount === 0 || scanning || cleaning} variant="accent" className="gap-2">
          <Trash2 size={14} />
          Trash {formatBytes(selectedBytes)}
        </Button>
      </div>
    </div>
  );
}
