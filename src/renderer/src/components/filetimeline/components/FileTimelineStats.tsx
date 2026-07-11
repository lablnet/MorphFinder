import { GitBranch } from 'lucide-react';
import { FileTimelineStat } from './FileTimelineStat';
import type { FileTimelineScanResult } from '@shared/types/fileTimeline';

export function FileTimelineStats({ result }: { result: FileTimelineScanResult | null }): React.JSX.Element {
  return (
    <div className="mb-4 grid grid-cols-3 gap-3">
      <FileTimelineStat label="Files" value={result?.items.length.toString() ?? '--'} />
      <FileTimelineStat label="Scanned" value={result?.scannedCount.toString() ?? '--'} />
      <div className="rounded-shell border border-shell-border bg-shell-sidebar/30 p-3">
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-current/45">
          <GitBranch size={11} />
          Git
        </div>
        <div className="mt-1 truncate text-lg font-bold text-shell-accent">{result?.isGitRepo ? 'Repo' : '--'}</div>
      </div>
    </div>
  );
}
