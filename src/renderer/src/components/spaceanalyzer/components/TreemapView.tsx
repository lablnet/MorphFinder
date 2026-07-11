import React from 'react';
import { useElementSize } from '@renderer/hooks';
import { computeTreemapLayout } from '@renderer/lib/treemapLayout';
import { TreemapNode } from './TreemapNode';
import type { SpaceAnalyzerNode } from '@shared/types/spaceAnalyzer';

interface TreemapViewProps {
  children: SpaceAnalyzerNode[];
  totalSize: number;
  onDrillDown: (node: SpaceAnalyzerNode) => void;
  hoveredPath: string | null;
  setHoveredPath: (path: string | null) => void;
}

export function TreemapView({
  children,
  totalSize,
  onDrillDown,
  hoveredPath,
  setHoveredPath,
}: TreemapViewProps): React.JSX.Element {
  const [containerRef, { width, height }] = useElementSize<HTMLDivElement>();

  // Compute absolute layout positions for children in the container dimensions
  const rects = React.useMemo(() => {
    return computeTreemapLayout(children, totalSize, width, height);
  }, [children, totalSize, width, height]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden min-h-[300px]">
      {rects.length === 0 ? (
        <div className="flex h-full items-center justify-center text-xs text-current/40">
          No displayable children elements inside this folder.
        </div>
      ) : (
        rects.map((rect) => (
          <TreemapNode
            key={rect.id}
            rect={rect}
            onDrillDown={onDrillDown}
            onHover={setHoveredPath}
            isHovered={hoveredPath === rect.path}
          />
        ))
      )}
    </div>
  );
}
