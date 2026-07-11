import React, { useMemo } from 'react';
import type { SpaceAnalyzerNode } from '@shared/types/spaceAnalyzer';
import { formatBytes } from '@renderer/lib/format';
import { cn } from '@lablnet/ui';

interface DonutViewProps {
  children: SpaceAnalyzerNode[];
  totalSize: number;
  onDrillDown: (node: SpaceAnalyzerNode) => void;
  hoveredPath: string | null;
  setHoveredPath: (path: string | null) => void;
  selectedPath: string | null;
  onSelectNode: (path: string | null) => void;
}

const PALETTE_COLORS = [
  'rgb(59, 130, 246)',   // Blue
  'rgb(16, 185, 129)',   // Emerald
  'rgb(245, 158, 11)',   // Amber
  'rgb(239, 68, 68)',    // Red
  'rgb(139, 92, 246)',   // Violet
  'rgb(6, 182, 212)',    // Cyan
  'rgb(236, 72, 153)',   // Pink
  'rgb(99, 102, 241)',   // Indigo
  'rgb(20, 184, 166)',   // Teal
  'rgb(100, 116, 139)',  // Slate
];

export function DonutView({
  children,
  totalSize,
  onDrillDown,
  hoveredPath,
  setHoveredPath,
  selectedPath,
  onSelectNode,
}: DonutViewProps): React.JSX.Element {
  const sortedSlices = useMemo(() => {
    return [...children].sort((a, b) => b.size - a.size);
  }, [children]);

  const slices = useMemo(() => {
    let accumulatedFraction = 0;
    return sortedSlices.map((child, index) => {
      const fraction = totalSize > 0 ? child.size / totalSize : 0;
      const sliceData = {
        node: child,
        fraction,
        accumulatedFraction,
        color: PALETTE_COLORS[index % PALETTE_COLORS.length]!,
      };
      accumulatedFraction += fraction;
      return sliceData;
    });
  }, [sortedSlices, totalSize]);

  // Circumference of circle with radius 60
  // C = 2 * pi * r = 376.99
  const circumference = 376.99;

  const activeHoveredSliceName = useMemo(() => {
    if (!hoveredPath) return null;
    const match = slices.find((s) => s.node.path === hoveredPath);
    return match ? `${match.node.name} (${(match.fraction * 100).toFixed(1)}%)` : null;
  }, [hoveredPath, slices]);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-6 items-center p-4">
      {/* Donut SVG display */}
      <div className="relative w-64 h-64 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 160 160" className="w-full h-full select-none transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="transparent"
            stroke="var(--shell-border)"
            strokeOpacity="0.2"
            strokeWidth="16"
          />

          {slices.map((slice) => {
            const isHovered = hoveredPath === slice.node.path;
            const isSelected = selectedPath === slice.node.path;

            return (
              <circle
                key={slice.node.path}
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered || isSelected ? 22 : 16}
                strokeDasharray={`${slice.fraction * circumference} ${circumference}`}
                strokeDashoffset={-slice.accumulatedFraction * circumference}
                className="cursor-pointer transition-all duration-200 hover:opacity-90"
                onMouseEnter={() => setHoveredPath(slice.node.path)}
                onMouseLeave={() => setHoveredPath(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(slice.node.path);
                }}
                onDoubleClick={() => onDrillDown(slice.node)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center text-center p-4 pointer-events-none select-none max-w-[160px] truncate">
          <span className="text-[10px] uppercase tracking-wider text-current/40 font-semibold mb-0.5">
            {activeHoveredSliceName ? 'Hovered' : 'Total'}
          </span>
          <span className="text-sm font-bold text-current truncate max-w-full">
            {activeHoveredSliceName
              ? activeHoveredSliceName.split(' ')[0]
              : formatBytes(totalSize)}
          </span>
          {activeHoveredSliceName && (
            <span className="text-[10px] font-semibold text-shell-accent mt-0.5">
              {activeHoveredSliceName.substring(activeHoveredSliceName.indexOf('('))}
            </span>
          )}
        </div>
      </div>

      {/* Legend & Details table list */}
      <div className="flex-1 w-full overflow-y-auto max-h-[300px] lg:max-h-full border border-shell-border/40 rounded-lg bg-shell-sidebar/20 p-3 select-none">
        <h4 className="text-xs font-semibold text-current/60 mb-2 uppercase tracking-wide px-1">
          Subdirectory Allocation
        </h4>
        <div className="flex flex-col gap-1">
          {slices.map((slice) => {
            const isHovered = hoveredPath === slice.node.path;
            const isSelected = selectedPath === slice.node.path;

            return (
              <div
                key={slice.node.path}
                className={cn(
                  'flex items-center justify-between p-2 rounded-md transition-colors cursor-pointer text-xs',
                  isHovered && 'bg-shell-accent/10',
                  isSelected && 'bg-shell-accent/20 border border-shell-accent/30',
                  !isHovered && !isSelected && 'hover:bg-shell-sidebar/40'
                )}
                onMouseEnter={() => setHoveredPath(slice.node.path)}
                onMouseLeave={() => setHoveredPath(null)}
                onClick={() => onSelectNode(slice.node.path)}
                onDoubleClick={() => onDrillDown(slice.node)}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate font-semibold text-current/90">
                    {slice.node.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono text-current/70 text-[10px] sm:text-xs">
                  <span>{formatBytes(slice.node.size)}</span>
                  <span className="opacity-60 w-10 text-right">
                    {(slice.fraction * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default DonutView;
