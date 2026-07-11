import { cn } from '@lablnet/ui';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import { useMemo, useState } from 'react';
import { useElementSize } from '@renderer/hooks/useElementSize';
import { formatBytes, formatModifiedDate } from '@renderer/lib/format';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { FileIcon } from '../fileicons/FileIcon';
import { marqueeSelectionForList, normalizedSelectionRect, type SelectionRect } from './selection';
import type { FileViewProps } from './types';
import { useFileItem } from '@renderer/hooks/useFileItem';
import { readDraggedPaths } from './dragDrop';

type SortKey = 'name' | 'kind' | 'size' | 'modified';
type SortDirection = 'asc' | 'desc';

interface RowData extends Omit<FileViewProps, 'nodes'> {
  nodes: FileSystemNode[];
}

interface MarqueeState {
  start: { x: number; y: number };
  current: { x: number; y: number };
}

function compareNodes(a: FileSystemNode, b: FileSystemNode, key: SortKey, direction: SortDirection): number {
  const multiplier = direction === 'asc' ? 1 : -1;
  if (key === 'size') return (a.sizeInBytes - b.sizeInBytes) * multiplier;
  if (key === 'modified') return (a.modifiedAt - b.modifiedAt) * multiplier;
  return a[key].localeCompare(b[key], undefined, { numeric: true, sensitivity: 'base' }) * multiplier;
}

interface ListFileItemProps {
  node: FileSystemNode;
  data: RowData;
  style: React.CSSProperties;
}

function ListFileItem({ node, data, style }: ListFileItemProps): React.JSX.Element {
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
    <div
      data-file-item="true"
      style={style}
      {...dragProps}
      {...mouseProps}
      className={cn(
        'grid cursor-default grid-cols-[minmax(180px,1fr)_120px_120px_180px] items-center text-sm',
        selected ? 'bg-[color:var(--shell-accent)]/15' : 'hover:bg-shell-sidebar',
      )}
    >
      <span className="flex min-w-0 items-center gap-2 truncate px-3">
        <FileIcon node={node} size={16} className={node.kind === 'directory' ? 'shrink-0 text-[color:var(--shell-accent)]' : 'shrink-0 text-current/70'} />
        {isRenaming ? (
          <input
            {...renameInputProps}
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

function ListRow({ index, style, data }: ListChildComponentProps<RowData>): React.JSX.Element | null {
  const node = data.nodes[index];
  if (node === undefined) return null;

  return <ListFileItem node={node} data={data} style={style} />;
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
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const [suppressNextClick, setSuppressNextClick] = useState(false);
  const rowHeight = density === 'compact' ? 28 : 34;
  const headerHeight = 33;
  const marqueeRect: SelectionRect | null = marquee === null ? null : normalizedSelectionRect(marquee.start, marquee.current);
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
        setMarquee({ start: pointFromEvent(event), current: pointFromEvent(event) });
      }}
      onMouseMove={(event) => {
        if (marquee === null) return;
        setMarquee((current) => (current === null ? null : { ...current, current: pointFromEvent(event) }));
      }}
      onMouseUp={() => {
        if (marqueeRect !== null) {
          const wasDrag = marqueeRect.right - marqueeRect.left > 3 || marqueeRect.bottom - marqueeRect.top > 3;
          onSelectionChange(marqueeSelectionForList(sortedNodes, marqueeRect, { rowHeight, topOffset: headerHeight }));
          setSuppressNextClick(wasDrag);
        }
        setMarquee(null);
      }}
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
