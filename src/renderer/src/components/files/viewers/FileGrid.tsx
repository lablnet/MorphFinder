import { cn } from '@lablnet/ui';
import { FixedSizeGrid, type GridChildComponentProps } from 'react-window';
import { useCallback } from 'react';
import { useElementSize } from '@renderer/hooks/useElementSize';
import { FileIcon } from '../../fileicons/FileIcon';
import { marqueeSelectionForGrid, type SelectionRect } from '../selection';
import type { FileViewProps } from '../types';
import { useFileItem } from '@renderer/hooks/useFileItem';
import { readDraggedPaths } from '../dragDrop';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { useMarquee } from '@renderer/hooks/useMarquee';

interface GridItemData extends FileViewProps {
  columnCount: number;
  iconSize: number;
}

interface GridFileItemProps {
  node: FileSystemNode;
  data: GridItemData;
  style: React.CSSProperties;
}

function GridFileItem({ node, data, style }: GridFileItemProps): React.JSX.Element {
  const { selected, isRenaming, dragProps, mouseProps, renameInputProps } = useFileItem({
    node,
    nodes: data.nodes,
    selectedPaths: data.selectedPaths,
    renamingPath: data.renamingPath,
    renamingValue: data.renamingValue,
    onOpen: data.onOpen,
    onSelectionChange: data.onSelectionChange,
    onContextMenu: data.onContextMenu,
    onCommitRename: data.onCommitRename,
    onCancelRename: data.onCancelRename,
    onRenameValueChange: data.onRenameValueChange,
    onMove: data.onMove,
    onExternalDrag: data.onExternalDrag,
  });

  return (
    <div style={style} className="p-1.5">
      <button
        data-file-item="true"
        type="button"
        title={node.name}
        {...dragProps}
        {...mouseProps}
        className={cn(
          'flex h-full w-full flex-col items-center justify-start gap-2 rounded-shell p-2 text-center text-xs outline-none',
          selected ? 'bg-[color:var(--shell-accent)]/15 ring-1 ring-[color:var(--shell-accent)]' : 'hover:bg-shell-sidebar',
        )}
      >
        <FileIcon node={node} size={data.iconSize} className={node.kind === 'directory' ? 'text-[color:var(--shell-accent)]' : 'text-current/75'} />
        {isRenaming ? (
          <input
            {...renameInputProps}
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

function GridCell({ columnIndex, rowIndex, style, data }: GridChildComponentProps<GridItemData>): React.JSX.Element | null {
  const index = rowIndex * data.columnCount + columnIndex;
  const node = data.nodes[index];
  if (node === undefined) return null;

  return <GridFileItem node={node} data={data} style={style} />;
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
