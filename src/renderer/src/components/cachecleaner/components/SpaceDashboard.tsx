import React from 'react';
import { formatBytes } from '../../../hooks/files/useCacheCleaner';

interface SpaceDashboardProps {
  scanning: boolean;
  totalScannedSize: number;
  totalSelectedSize: number;
  selectedCount: number;
  totalCount: number;
}

export function SpaceDashboard({
  scanning,
  totalScannedSize,
  totalSelectedSize,
  selectedCount,
  totalCount,
}: SpaceDashboardProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="rounded-shell border border-shell-border bg-shell-sidebar/30 p-4 transition-all hover:shadow-sm">
        <p className="text-xs font-medium text-current/40 mb-1 uppercase tracking-wider">Total Scanned Caches</p>
        <p className="text-2xl font-bold tracking-tight text-current">
          {scanning ? 'Calculating...' : formatBytes(totalScannedSize)}
        </p>
      </div>
      <div className="rounded-shell border border-shell-border bg-shell-sidebar/30 p-4 transition-all hover:shadow-sm">
        <p className="text-xs font-medium text-current/40 mb-1 uppercase tracking-wider">Selected to Clean</p>
        <p className="text-2xl font-bold tracking-tight text-shell-accent">
          {formatBytes(totalSelectedSize)}
        </p>
      </div>
      <div className="rounded-shell border border-shell-border bg-shell-sidebar/30 p-4 transition-all hover:shadow-sm">
        <p className="text-xs font-medium text-current/40 mb-1 uppercase tracking-wider">Selected Items</p>
        <p className="text-2xl font-bold tracking-tight text-current">
          {selectedCount} <span className="text-xs font-normal text-current/40">of {totalCount} targets</span>
        </p>
      </div>
    </div>
  );
}
