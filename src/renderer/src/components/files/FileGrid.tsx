import { cn } from '@lablnet/ui';
import { FixedSizeGrid, type GridChildComponentProps } from 'react-window';
import { useState } from 'react';
import { useElementSize } from '@renderer/hooks/useElementSize';
import { iconForNode } from './fileIcons';
import { marqueeSelectionForGrid, nextSelectionForEvent, normalizedSelectionRect, type SelectionRect } from './selection';
import type { FileViewProps } from './types';
import { pathsForDrag, readDraggedPaths, writeDraggedPaths } from './dragDrop';

interface GridItemData extends FileViewProps {
  columnCount: number;
  iconSize: number;
}

interface MarqueeState {
  start: { x: number; y: number };
  current: { x: number; y: number };
}

function GridCell({ columnIndex, rowIndex, style, data }: GridChildComponentProps<GridItemData>): React.JSX.Element | null {
  const index = rowIndex * data.columnCount + columnIndex;
  const node = data.nodes[index];
  if (node === undefined) return null;

  const Icon = iconForNode(node);
  const selected = data.selectedPaths.has(node.path);
  const isRenaming = data.renamingPath === node.path;

  return (
    <div style={style} className="p-1.5">
      <button
        data-file-item="true"
        type="button"
        title={node.name}
        draggable
        onDragStart={(event) => {
          const paths = pathsForDrag(node.path, data.selectedPaths);
          writeDraggedPaths(event.dataTransfer, paths);
          data.onExternalDrag(paths);
        }}
        onDragOver={(event) => {
          if (node.kind === 'directory') event.preventDefault();
        }}
        onDrop={(event) => {
          if (node.kind !== 'directory') return;
          event.preventDefault();
          event.stopPropagation();
          const paths = readDraggedPaths(event.dataTransfer).filter((path) => path !== node.path);
          if (paths.length > 0) data.onMove(paths, node.path);
        }}
        onMouseDown={(event) => {
          if (event.button === 0 && event.ctrlKey) event.preventDefault();
        }}
        onClick={(event) => {
          event.stopPropagation();
          data.onSelectionChange(nextSelectionForEvent(data.nodes, data.selectedPaths, node, event), node.path);
        }}
        onDoubleClick={() => {
          if (!isRenaming) data.onOpen(node);
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.ctrlKey) {
            data.onSelectionChange(nextSelectionForEvent(data.nodes, data.selectedPaths, node, event), node.path);
            return;
          }
          if (!data.selectedPaths.has(node.path)) data.onSelectionChange([node.path], node.path);
          data.onContextMenu(node, event);
        }}
        className={cn(
          'flex h-full w-full flex-col items-center justify-start gap-2 rounded-shell p-2 text-center text-xs outline-none',
          selected ? 'bg-[color:var(--shell-accent)]/15 ring-1 ring-[color:var(--shell-accent)]' : 'hover:bg-shell-sidebar',
        )}
      >
        <Icon size={data.iconSize} className={node.kind === 'directory' ? 'text-[color:var(--shell-accent)]' : 'text-current/75'} />
        {isRenaming ? (
          <input
            autoFocus
            value={data.renamingValue}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => data.onRenameValueChange(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            onBlur={data.onCommitRename}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                data.onCommitRename();
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                data.onCancelRename();
              }
            }}
            aria-invalid={data.renamingError !== null}
            title={data.renamingError ?? undefined}
            className={cn(
              'h-6 w-full rounded border bg-shell-surface px-1 text-center text-xs outline-none',
              data.renamingError === null ? 'border-[color:var(--shell-accent)]' : 'border-red-500',
            )}
          />
        ) : (
          <span className="line-clamp-2 w-full break-words">{node.name}</span>
        )}
      </button>
    </div>
  );
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
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const [suppressNextClick, setSuppressNextClick] = useState(false);
  const iconSize = density === 'compact' ? 28 : 36;
  const columnWidth = density === 'compact' ? 96 : 112;
  const rowHeight = density === 'compact' ? 92 : 112;
  const columnCount = Math.max(1, Math.floor(size.width / columnWidth));
  const resolvedColumnWidth = size.width > 0 ? Math.floor(size.width / columnCount) : columnWidth;
  const rowCount = Math.ceil(nodes.length / columnCount);
  const marqueeRect: SelectionRect | null = marquee === null ? null : normalizedSelectionRect(marquee.start, marquee.current);

  const pointFromEvent = (event: React.MouseEvent): { x: number; y: number } => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

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
      onMouseDown={(event) => {
        if (event.button !== 0 || (event.target as Element).closest('[data-file-item="true"]') !== null) return;
        const point = pointFromEvent(event);
        setMarquee({ start: point, current: point });
      }}
      onMouseMove={(event) => {
        if (marquee === null) return;
        setMarquee((current) => (current === null ? null : { ...current, current: pointFromEvent(event) }));
      }}
      onMouseUp={() => {
        if (marqueeRect !== null) {
          const wasDrag = marqueeRect.right - marqueeRect.left > 3 || marqueeRect.bottom - marqueeRect.top > 3;
          onSelectionChange(
            marqueeSelectionForGrid(nodes, marqueeRect, {
              columnCount,
              columnWidth: resolvedColumnWidth,
              rowHeight,
            }),
          );
          setSuppressNextClick(wasDrag);
        }
        setMarquee(null);
      }}
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
