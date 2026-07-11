import { RefreshCw } from 'lucide-react';
import type { DuplicateProgressState } from '@renderer/hooks/duplicates/useDuplicateFinder';

export function DuplicateLoadingState({ progress }: { progress: DuplicateProgressState | null }): React.JSX.Element {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-3 text-current/55">
      <RefreshCw size={26} className="animate-spin text-shell-accent" />
      <span className="font-medium text-current">{progress?.phase === 'hashing' ? 'Hashing duplicate candidates...' : 'Scanning duplicate candidates...'}</span>
      <span className="text-xs">Found duplicate groups will appear here while the scan keeps running.</span>
    </div>
  );
}
