import { cn } from '@lablnet/ui';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import { useMemo, useState, useCallback } from 'react';
import { formatBytes, formatModifiedDate } from '@renderer/lib/format';
import type { FileSystemNode } from '@shared/types/fileSystem';
import type { GitFileStatus } from '@shared/types/git';
import { FileIcon } from '../../fileicons/FileIcon';
import { marqueeSelectionForList, type SelectionRect } from '../selection';
import type { FileViewProps } from '../types';
import { readDraggedPaths } from '../dragDrop';
import { useElementSize, useFileItem, useMarquee } from '@renderer/hooks';
import { Button } from '@renderer/components/ui/Button';
import { useAppStore } from '@renderer/store';

type SortKey = 'name' | 'kind' | 'size' | 'modified';
type SortDirection = 'asc' | 'desc';

interface RowData extends Omit<FileViewProps, 'nodes'> {
  nodes: FileSystemNode[];
  gitStatusMap?: Record<string, GitFileStatus> | undefined;
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

  const gitStatus = data.gitStatusMap?.[node.path];
  const gitLabel = gitStatus
    ? {
        modified: 'M',
        staged: 'S',
        added: 'A',
        untracked: 'U',
        ignored: 'I',
      }[gitStatus]
    : '';

  const gitColorClass = gitStatus
    ? {
        modified: 'text-amber-500 font-semibold',
        staged: 'text-green-600 font-semibold',
        added: 'text-green-500 font-semibold',
        untracked: 'text-blue-500 font-semibold',
        ignored: 'text-gray-400 opacity-50',
      }[gitStatus]
    : '';

  const annotations = useAppStore((state) => state.annotations);
  const annotation = annotations[node.path];
  const tags = annotation?.tags || [];

  return (
    <div
      data-file-item="true"
      style={style}
      {...dragProps}
      {...mouseProps}
      className={cn(
        'grid cursor-default grid-cols-[minmax(180px,1fr)_120px_120px_180px_80px] items-center text-sm',
        selected ? 'bg-[color:var(--shell-accent)]/15 ring-1 ring-[color:var(--shell-accent)] ring-inset' : 'hover:bg-shell-sidebar',
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
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className={cn(
              'truncate',
              gitStatus === 'modified' && 'text-amber-600 dark:text-amber-400 font-medium',
              gitStatus === 'added' && 'text-green-600 dark:text-green-400 font-medium',
              gitStatus === 'untracked' && 'text-blue-600 dark:text-blue-400 font-medium',
              gitStatus === 'ignored' && 'text-current/30 line-through'
            )}>{node.name}</span>
            {tags.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium border text-current/90 shrink-0 select-none"
                style={{ backgroundColor: `${t.color}15`, borderColor: t.color }}
                title={t.label}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                {t.label}
              </span>
            ))}
          </div>
        )}
      </span>
      <span className="truncate px-3 capitalize text-current/70">{node.kind}</span>
      <span className="truncate px-3 text-right text-current/70">{node.kind === 'directory' ? '--' : formatBytes(node.sizeInBytes)}</span>
      <span className="truncate px-3 text-current/70">{formatModifiedDate(node.modifiedAt)}</span>
      <span className={cn('truncate px-3 text-center text-xs font-semibold', gitColorClass)}>
        {gitLabel || '--'}
      </span>
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
  gitStatusMap,
}: FileViewProps): React.JSX.Element {
  console.log('[FileListTable] render, selectedPaths size:', selectedPaths.size);
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
      {size.width > 0 && size.height > rowHeight ? (
        <FixedSizeList
          height={size.height - rowHeight}
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
