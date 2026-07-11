import React from 'react';
import type { SpaceAnalyzerNode } from '@shared/types/spaceAnalyzer';
import { formatBytes } from '@renderer/lib/format';
import { HardDrive, Info, InfoIcon } from 'lucide-react';

interface FooterProps {
  scanResult: SpaceAnalyzerNode | null;
  hoveredNode: SpaceAnalyzerNode | null;
  diskTotal: number;
  diskFree: number;
}

export function Footer({ scanResult, hoveredNode, diskTotal, diskFree }: FooterProps): React.JSX.Element {
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-shell-border bg-shell-sidebar/70 p-3 text-xs text-current/60 select-none">
      {hoveredNode ? (
        <div className="flex items-center gap-2 truncate animate-fade-in">
          <InfoIcon size={13} className="text-shell-accent shrink-0" />
          <span className="truncate">
            <strong className="text-current">{hoveredNode.name}</strong>:{' '}
            <span className="font-mono text-current/80">{formatBytes(hoveredNode.size)}</span>
            {hoveredNode.isDirectory && (
              <span className="opacity-75">
                {' '}
                ({hoveredNode.fileCount} {hoveredNode.fileCount === 1 ? 'file' : 'files'} inside)
              </span>
            )}
          </span>
        </div>
      ) : scanResult ? (
        <div className="flex items-center gap-2 truncate">
          <HardDrive size={13} className="text-current/40 shrink-0" />
          <span className="truncate">
            Total weight: <strong className="text-current font-mono">{formatBytes(scanResult.size)}</strong>
            <span className="opacity-75">
              {' '}
              ({scanResult.fileCount} {scanResult.fileCount === 1 ? 'file' : 'files'} scanned)
            </span>
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 opacity-60">
          <Info size={13} className="shrink-0 text-shell-accent/80" />
          <span>Enter a folder path and click Scan to begin analyzer.</span>
        </div>
      )}

      {/* Disk Partition Free Capacity */}
      {diskTotal > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] text-current/50 select-none">
          <span className="hidden sm:inline">Drive Available:</span>
          <span className="font-mono font-semibold text-current/80">
            {formatBytes(diskFree)}
          </span>
          <span className="opacity-60">/</span>
          <span className="font-mono">{formatBytes(diskTotal)}</span>
          <span className="hidden lg:inline text-current/35">({((diskFree / diskTotal) * 100).toFixed(0)}% free)</span>
        </div>
      )}
    </div>
  );
}
export default Footer;
