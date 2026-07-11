import { FixedSizeGrid } from 'react-window';
import { useCallback } from 'react';
import { marqueeSelectionForGrid, type SelectionRect } from '../selection';
import type { FileViewProps } from '../types';
import { readDraggedPaths } from '../dragDrop';
import { useElementSize, useMarquee } from '@renderer/hooks';
import { GridCell } from './GridCell';

export interface GridItemData extends FileViewProps {
  columnCount: number;
  iconSize: number;
}

export function FileGrid({
  nodes,
  selectedPaths,
  density,
  onOpen,
  onSelectionChange,
  onContextMenu,
  onStartRename,
  renamingPath,
  renamingValue,
  renamingError,
  onRenameValueChange,
  onCommitRename,
  onCancelRename,
  dropDestinationPath,
  onMove,
  onExternalDrag,
}: FileViewProps): React.JSX.Element {
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const iconSize = density === 'compact' ? 28 : 36;
  const columnWidth = density === 'compact' ? 96 : 112;
  const rowHeight = density === 'compact' ? 92 : 112;
  const columnCount = Math.max(1, Math.floor(size.width / columnWidth));
  const resolvedColumnWidth = size.width > 0 ? Math.floor(size.width / columnCount) : columnWidth;
  const rowCount = Math.ceil(nodes.length / columnCount);

  const calculateSelection = useCallback(
    (rect: SelectionRect) =>
      marqueeSelectionForGrid(nodes, rect, {
        columnCount,
        columnWidth: resolvedColumnWidth,
        rowHeight,
      }),
    [nodes, columnCount, resolvedColumnWidth, rowHeight]
  );

  const {
    marqueeRect,
    suppressNextClick,
    setSuppressNextClick,
    marqueeHandlers,
  } = useMarquee(onSelectionChange, calculateSelection);

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-hidden"
      onClick={() => {
        if (suppressNextClick) {
          setSuppressNextClick(false);
          return;
        }
        onSelectionChange([]);
      }}
      {...marqueeHandlers}
      onContextMenu={(event) => onContextMenu(null, event)}
      onDragOver={(event) => {
        if (dropDestinationPath !== null) event.preventDefault();
      }}
      onDrop={(event) => {
        if (dropDestinationPath === null || event.target !== event.currentTarget) return;
        event.preventDefault();
        const paths = readDraggedPaths(event.dataTransfer);
        if (paths.length > 0) onMove(paths, dropDestinationPath);
      }}
    >
      {size.width > 0 && size.height > 0 ? (
        <FixedSizeGrid
          columnCount={columnCount}
          columnWidth={resolvedColumnWidth}
          height={size.height}
          rowCount={rowCount}
          rowHeight={rowHeight}
          width={size.width}
          itemData={{ nodes, selectedPaths, density, onOpen, onSelectionChange, onContextMenu, onStartRename, renamingPath, renamingValue, renamingError, onRenameValueChange, onCommitRename, onCancelRename, dropDestinationPath, onMove, onExternalDrag, columnCount, iconSize }}
        >
          {GridCell}
        </FixedSizeGrid>
      ) : null}
      {marqueeRect !== null ? (
        <div
          className="pointer-events-none absolute border border-[color:var(--shell-accent)] bg-[color:var(--shell-accent)]/15"
          style={{
            left: marqueeRect.left,
            top: marqueeRect.top,
            width: marqueeRect.right - marqueeRect.left,
            height: marqueeRect.bottom - marqueeRect.top,
          }}
        />
      ) : null}
    </div>
  );
}
