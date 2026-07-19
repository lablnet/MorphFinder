import { cn } from '@lablnet/ui';
import { FixedSizeList } from 'react-window';
import { useMemo, useState, useCallback } from 'react';
import type { FileSystemNode } from '@shared/types/fileSystem';
import type { GitFileStatus } from '@shared/types/git';
import { marqueeSelectionForList, type SelectionRect } from '../selection';
import type { FileViewProps } from '../types';
import { readDraggedPaths } from '../dragDrop';
import { useElementSize, useMarquee } from '@renderer/hooks';
import { Button } from '@renderer/components/ui/Button';
import { ListRow } from './ListRow';

type SortKey = 'name' | 'kind' | 'size' | 'modified';
type SortDirection = 'asc' | 'desc';

export interface RowData extends Omit<FileViewProps, 'nodes'> {
  nodes: FileSystemNode[];
  gitStatusMap?: Record<string, GitFileStatus> | undefined;
}

function compareNodes(a: FileSystemNode, b: FileSystemNode, key: SortKey, direction: SortDirection): number {
  const multiplier = direction === 'asc' ? 1 : -1;
  if (key === 'size') return (a.sizeInBytes - b.sizeInBytes) * multiplier;
  if (key === 'modified') return (a.modifiedAt - b.modifiedAt) * multiplier;
  return a[key].localeCompare(b[key], undefined, { numeric: true, sensitivity: 'base' }) * multiplier;
}

export function FileListTable({
  nodes,
  selectedPaths,
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
  density,
  dropDestinationPath,
  onMove,
  onExternalDrag,
  gitStatusMap,
}: FileViewProps): React.JSX.Element {
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const rowHeight = density === 'compact' ? 28 : 34;
  const headerHeight = 33;
  const sortedNodes = useMemo(
    () => [...nodes].sort((a, b) => compareNodes(a, b, sortKey, sortDirection)),
    [nodes, sortDirection, sortKey],
  );

  const sortBy = (key: SortKey): void => {
    if (key === sortKey) setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const header = (key: SortKey, label: string, className = ''): React.JSX.Element => (
    <Button
      onClick={() => sortBy(key)}
      variant="ghost"
      className={cn(
        'truncate px-3 py-2 rounded-none hover:bg-shell-sidebar font-medium text-current/60 text-xs',
        className.includes('text-right') ? 'justify-end' : 'justify-start',
        className
      )}
    >
      {label}
      {sortKey === key ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
    </Button>
  );

  const calculateSelection = useCallback(
    (rect: SelectionRect) =>
      marqueeSelectionForList(sortedNodes, rect, { rowHeight, topOffset: headerHeight }),
    [sortedNodes, rowHeight]
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
        if (dropDestinationPath === null) return;
        event.preventDefault();
        const paths = readDraggedPaths(event.dataTransfer);
        if (paths.length > 0) onMove(paths, dropDestinationPath);
      }}
    >
      <div className="grid grid-cols-[minmax(180px,1fr)_120px_120px_180px_80px] border-b border-shell-border bg-shell-surface text-xs font-medium text-current/60">
        {header('name', 'Name')}
        {header('kind', 'Kind')}
        {header('size', 'Size', 'text-right')}
        {header('modified', 'Modified')}
        <span className="px-3 py-2 text-center text-current/60 font-semibold select-none">Git</span>
      </div>
      {size.width > 0 && size.height > headerHeight ? (
        <FixedSizeList
          height={size.height - headerHeight}
          itemCount={sortedNodes.length}
          itemData={{ nodes: sortedNodes, selectedPaths, density, onOpen, onSelectionChange, onContextMenu, onStartRename, renamingPath, renamingValue, renamingError, onRenameValueChange, onCommitRename, onCancelRename, dropDestinationPath, onMove, onExternalDrag, gitStatusMap }}
          itemSize={rowHeight}
          width={size.width}
        >
          {ListRow}
        </FixedSizeList>
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
