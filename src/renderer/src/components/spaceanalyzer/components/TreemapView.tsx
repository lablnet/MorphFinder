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
  selectedPath: string | null;
  onSelectNode: (path: string | null) => void;
}

export function TreemapView({
  children,
  totalSize,
  onDrillDown,
  hoveredPath,
  setHoveredPath,
  selectedPath,
  onSelectNode,
}: TreemapViewProps): React.JSX.Element {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();

  const rects = React.useMemo(() => {
    return computeTreemapLayout(children, totalSize, width, height);
  }, [children, totalSize, width, height]);

  return (
    <div ref={ref} className="w-full h-full relative overflow-hidden select-none" onClick={() => onSelectNode(null)}>
      {rects.map((rect) => (
        <TreemapNode
          key={rect.id}
          rect={rect}
          onDrillDown={onDrillDown}
          onHover={setHoveredPath}
          isHovered={hoveredPath === rect.path}
          isSelected={selectedPath === rect.path}
          onSelectNode={onSelectNode}
        />
      ))}
    </div>
  );
}
export default TreemapView;
