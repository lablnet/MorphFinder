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
}

function getColorForNode(name: string, isDirectory: boolean): string {
  if (name === '[Other Files & Folders]') return 'hsla(0, 0%, 50%, 0.15)';

  if (isDirectory) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    // Vibrant warm colors for directories
    return `hsla(${h}, 65%, 45%, 0.22)`;
  } else {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    switch (ext) {
      case 'zip':
      case 'tar':
      case 'gz':
      case 'rar':
      case '7z':
        return 'hsla(28, 80%, 50%, 0.25)'; // Orange (compressed files)
      case 'mp4':
      case 'mkv':
      case 'avi':
      case 'mov':
      case 'mp3':
      case 'wav':
        return 'hsla(340, 80%, 50%, 0.25)'; // Crimson (media)
      case 'dmg':
      case 'pkg':
      case 'exe':
      case 'msi':
      case 'app':
        return 'hsla(140, 75%, 42%, 0.25)'; // Green (executables)
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return 'hsla(200, 85%, 50%, 0.25)'; // Light Blue (images)
      case 'json':
      case 'js':
      case 'ts':
      case 'tsx':
      case 'html':
      case 'css':
      case 'rs':
      case 'py':
        return 'hsla(270, 80%, 55%, 0.25)'; // Purple (code)
      default:
        return 'hsla(220, 12%, 60%, 0.15)'; // Gray (general files)
    }
  }
}

export function TreemapNode({ rect, onDrillDown, onHover, isHovered }: TreemapNodeProps): React.JSX.Element {
  const { name, size, isDirectory, x, y, width, height, percentage } = rect;
  const isLargeEnough = width > 75 && height > 45;
  const isLabelVisible = width > 50 && height > 30;

  const nodeColor = getColorForNode(name, isDirectory);

  // Border style depending on hovered state
  const borderClass = isHovered
    ? 'border-shell-accent shadow-lg scale-[1.01] z-10 brightness-110'
    : 'border-shell-border/40 hover:border-shell-accent/60';

  const handleClick = (e: React.MouseEvent) => {
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
      onMouseEnter={() => onHover(rect.path)}
      onMouseLeave={() => onHover(null)}
      title={`${name}\nSize: ${formatBytes(size)} (${percentage.toFixed(1)}%)`}
    >
      {isLabelVisible && (
        <div className="flex flex-col min-w-0 h-full justify-between">
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
