import React from 'react';
import type { LayoutRect } from '@renderer/lib/treemapLayout';
import { formatBytes } from '@renderer/lib/format';
import { FolderOpen } from 'lucide-react';
import { cn } from '@lablnet/ui';

interface TreemapNodeProps {
  rect: LayoutRect;
  onDrillDown: (node: { path: string; name: string; isDirectory: boolean; fileCount: number; size: number }) => void;
  onHover: (path: string | null) => void;
  isHovered: boolean;
  isSelected: boolean;
  onSelectNode: (path: string | null) => void;
}

function getColorForNode(name: string, isDirectory: boolean): string {
  if (name === '[Other Files & Folders]') return 'hsla(0, 0%, 50%, 0.15)';

  if (isDirectory) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsla(${h}, 65%, 45%, 0.22)`;
  } else {
    // Cool pastel colors for normal files
    const fileExtensions = name.split('.').pop() || '';
    let hash = 0;
    for (let i = 0; i < fileExtensions.length; i++) {
      hash = fileExtensions.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsla(${h}, 70%, 65%, 0.24)`;
  }
}

export function TreemapNode({
  rect,
  onDrillDown,
  onHover,
  isHovered,
  isSelected,
  onSelectNode,
}: TreemapNodeProps): React.JSX.Element {
  const { name, size, isDirectory, percentage, width, height, x, y } = rect;

  const nodeColor = getColorForNode(name, isDirectory);

  // Determine label layout eligibility
  const isLabelVisible = width > 45 && height > 25;
  const isLargeEnough = width > 75 && height > 45;

  const borderClass = isSelected
    ? 'border-shell-accent ring-2 ring-shell-accent/40 shadow-xl scale-[1.01] z-20 brightness-110'
    : isHovered
    ? 'border-shell-accent shadow-lg scale-[1.01] z-10 brightness-105'
    : 'border-shell-border/40 hover:border-shell-accent/60';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNode(rect.path === '__other__' ? null : rect.path);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDirectory && name !== '[Other Files & Folders]') {
      onDrillDown(rect);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: nodeColor,
      }}
      className={cn(
        'group flex flex-col justify-between p-2.5 overflow-hidden border rounded-shell transition-all duration-150 cursor-pointer select-none backdrop-blur-[1px]',
        borderClass
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => onHover(rect.path)}
      onMouseLeave={() => onHover(null)}
      title={`${name}\nSize: ${formatBytes(size)} (${percentage.toFixed(1)}%)`}
    >
      {isLabelVisible && (
        <div className="flex flex-col min-w-0 h-full justify-between pointer-events-none">
          <div className="flex items-start gap-1 min-w-0">
            {isDirectory && name !== '[Other Files & Folders]' && (
              <FolderOpen size={13} className="shrink-0 text-shell-accent/70 mt-0.5" />
            )}
            <span className="text-[11px] font-semibold leading-tight text-current truncate w-full">
              {name}
            </span>
          </div>

          {isLargeEnough && (
            <div className="flex items-center justify-between mt-1 text-[10px] text-current/50 font-medium select-none">
              <span>{formatBytes(size)}</span>
              <span>{percentage.toFixed(1)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default TreemapNode;
