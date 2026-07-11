import { cn } from '@lablnet/ui';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import { useMemo, useState } from 'react';
import { useElementSize } from '@renderer/hooks/useElementSize';
import { formatBytes, formatModifiedDate } from '@renderer/lib/format';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { iconForNode } from './fileIcons';
import { nextSelectionForEvent } from './selection';
import type { FileViewProps } from './types';
import { pathsForDrag, readDraggedPaths, writeDraggedPaths } from './dragDrop';

type SortKey = 'name' | 'kind' | 'size' | 'modified';
type SortDirection = 'asc' | 'desc';

interface RowData extends Omit<FileViewProps, 'nodes'> {
  nodes: FileSystemNode[];
}

function compareNodes(a: FileSystemNode, b: FileSystemNode, key: SortKey, direction: SortDirection): number {
  const multiplier = direction === 'asc' ? 1 : -1;
  if (key === 'size') return (a.sizeInBytes - b.sizeInBytes) * multiplier;
  if (key === 'modified') return (a.modifiedAt - b.modifiedAt) * multiplier;
  return a[key].localeCompare(b[key], undefined, { numeric: true, sensitivity: 'base' }) * multiplier;
}

function ListRow({ index, style, data }: ListChildComponentProps<RowData>): React.JSX.Element | null {
  const node = data.nodes[index];
  if (node === undefined) return null;

  const Icon = iconForNode(node);
  const selected = data.selectedPaths.has(node.path);
  const isRenaming = data.renamingPath === node.path;

  return (
    <div
      style={style}
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
        'grid cursor-default grid-cols-[minmax(180px,1fr)_120px_120px_180px] items-center text-sm',
        selected ? 'bg-[color:var(--shell-accent)]/15' : 'hover:bg-shell-sidebar',
      )}
    >
      <span className="flex min-w-0 items-center gap-2 truncate px-3">
        <Icon size={16} className={node.kind === 'directory' ? 'shrink-0 text-[color:var(--shell-accent)]' : 'shrink-0 text-current/70'} />
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
              'h-6 min-w-0 flex-1 rounded border bg-shell-surface px-1 text-sm outline-none',
              data.renamingError === null ? 'border-[color:var(--shell-accent)]' : 'border-red-500',
            )}
          />
        ) : (
          <span className="truncate">{node.name}</span>
        )}
      </span>
      <span className="truncate px-3 capitalize text-current/70">{node.kind}</span>
      <span className="truncate px-3 text-right text-current/70">{node.kind === 'directory' ? '--' : formatBytes(node.sizeInBytes)}</span>
      <span className="truncate px-3 text-current/70">{formatModifiedDate(node.modifiedAt)}</span>
    </div>
  );
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
}: FileViewProps): React.JSX.Element {
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const rowHeight = density === 'compact' ? 28 : 34;
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
    <button type="button" onClick={() => sortBy(key)} className={cn('truncate px-3 py-2 text-left hover:bg-shell-sidebar', className)}>
      {label}
      {sortKey === key ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
    </button>
  );

  return (
    <div
      ref={containerRef}
      className="h-full overflow-hidden"
      onClick={() => onSelectionChange([])}
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
      <div className="grid grid-cols-[minmax(180px,1fr)_120px_120px_180px] border-b border-shell-border bg-shell-surface text-xs font-medium text-current/60">
        {header('name', 'Name')}
        {header('kind', 'Kind')}
        {header('size', 'Size', 'text-right')}
        {header('modified', 'Modified')}
      </div>
      {size.width > 0 && size.height > rowHeight ? (
        <FixedSizeList
          height={size.height - rowHeight}
          itemCount={sortedNodes.length}
          itemData={{ nodes: sortedNodes, selectedPaths, density, onOpen, onSelectionChange, onContextMenu, onStartRename, renamingPath, renamingValue, renamingError, onRenameValueChange, onCommitRename, onCancelRename, dropDestinationPath, onMove, onExternalDrag }}
          itemSize={rowHeight}
          width={size.width}
        >
          {ListRow}
        </FixedSizeList>
      ) : null}
    </div>
  );
}
