import type { DuplicateScanMeta } from '@renderer/hooks/duplicates/useDuplicateFinder';
import { DuplicateStat } from './DuplicateStat';

export function DuplicateStats({
  groupsCount,
  selectedCount,
  scanMeta,
}: {
  groupsCount: number;
  selectedCount: number;
  scanMeta: DuplicateScanMeta | null;
}): React.JSX.Element {
  return (
    <div className="mb-4 grid grid-cols-4 gap-3">
      <DuplicateStat label="Groups" value={groupsCount.toString()} />
      <DuplicateStat label="Selected" value={selectedCount.toString()} />
      <DuplicateStat label="Scanned" value={scanMeta?.scannedCount.toString() ?? '--'} />
      <DuplicateStat label="Hashed" value={scanMeta?.hashedCount.toString() ?? '--'} />
    </div>
  );
}
