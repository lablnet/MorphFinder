import React from 'react';
import type { SpaceAnalyzerNode } from '@shared/types/spaceAnalyzer';
import { formatBytes } from '@renderer/lib/format';
import { Folder, File, ChevronRight } from 'lucide-react';
import { cn } from '@lablnet/ui';

interface ListViewProps {
  children: SpaceAnalyzerNode[];
  totalSize: number;
  onDrillDown: (node: SpaceAnalyzerNode) => void;
  hoveredPath: string | null;
  setHoveredPath: (path: string | null) => void;
  selectedPath: string | null;
  onSelectNode: (path: string | null) => void;
}

export function ListView({
  children,
  totalSize,
  onDrillDown,
  hoveredPath,
  setHoveredPath,
  selectedPath,
  onSelectNode,
}: ListViewProps): React.JSX.Element {
  if (children.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-current/40 py-8">
        No displayable items found inside this folder.
      </div>
    );
  }

  // Pre-sort children by size descending
  const sortedItems = [...children].sort((a, b) => b.size - a.size);

  return (
    <div className="w-full h-full overflow-y-auto border border-shell-border/40 rounded-lg select-none bg-shell-sidebar/10">
      <table className="w-full text-left border-collapse" onClick={() => onSelectNode(null)}>
        <thead>
          <tr className="border-b border-shell-border text-[10px] font-bold uppercase tracking-wider text-current/50 select-none bg-shell-sidebar/35">
            <th className="py-2.5 px-4 font-semibold">Name</th>
            <th className="py-2.5 px-4 font-semibold text-right w-24">Size</th>
            <th className="py-2.5 px-4 font-semibold text-right w-24">Percentage</th>
            <th className="py-2.5 px-4 font-semibold w-32 sm:w-48">Allocation</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => {
            const percentage = totalSize > 0 ? (item.size / totalSize) * 100 : 0;
            const isHovered = hoveredPath === item.path;
            const isSelected = selectedPath === item.path;

            const handleRowClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              onSelectNode(item.path === '__other__' ? null : item.path);
            };

            const handleRowDoubleClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (item.isDirectory && item.name !== '[Other Files & Folders]') {
                onDrillDown(item);
              }
            };

            return (
              <tr
                key={item.path}
                className={cn(
                  'transition-colors duration-75 cursor-pointer relative',
                  isSelected
                    ? 'bg-shell-accent/15 border-l-2 border-shell-accent'
                    : isHovered
                    ? 'bg-shell-accent/10'
                    : 'hover:bg-shell-sidebar/30'
                )}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
                onClick={handleRowClick}
                onDoubleClick={handleRowDoubleClick}
              >
                {/* Name */}
                <td className="py-3 px-4 font-medium flex items-center gap-2 max-w-sm sm:max-w-md truncate">
                  {item.isDirectory ? (
                    <Folder size={14} className="text-shell-accent/80 shrink-0" />
                  ) : (
                    <File size={14} className="text-current/60 shrink-0" />
                  )}
                  <span className="truncate flex-1 font-semibold">{item.name}</span>
                  {item.isDirectory && item.name !== '[Other Files & Folders]' && (
                    <ChevronRight size={12} className="text-current/30 shrink-0 opacity-0 group-hover:opacity-100" />
                  )}
                </td>

                {/* Size */}
                <td className="py-3 px-4 text-right font-mono text-current/90 font-medium">
                  {formatBytes(item.size)}
                </td>

                {/* Percentage */}
                <td className="py-3 px-4 text-right font-mono text-current/80 font-semibold">
                  {percentage.toFixed(1)}%
                </td>

                {/* Allocation Progress Bar */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-shell-sidebar border border-shell-border/50 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={cn(
                          'h-full rounded-full transition-all duration-300',
                          item.isDirectory ? 'bg-shell-accent' : 'bg-shell-accent opacity-65'
                        )}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
export default ListView;
