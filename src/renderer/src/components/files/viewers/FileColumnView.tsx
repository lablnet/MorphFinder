import { ChevronRight } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { useCallback } from 'react';
import { FileIcon } from '../../fileicons/FileIcon';
import { marqueeSelectionForList, type SelectionRect } from '../selection';
import type { FileViewProps } from '../types';
import { readDraggedPaths } from '../dragDrop';
import { useFileItem } from '@renderer/hooks/useFileItem';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { useMarquee } from '@renderer/hooks/useMarquee';

interface ColumnFileItemProps {
  node: FileSystemNode;
  nodes: FileSystemNode[];
  selectedPaths: ReadonlySet<string>;
  onOpen: (node: FileSystemNode) => void;
  onSelectionChange: (paths: string[], anchorPath?: string) => void;
  onContextMenu: (node: FileSystemNode | null, event: React.MouseEvent) => void;
  renamingPath: string | null;
  renamingValue: string;
  renamingError: string | null;
  onRenameValueChange: (value: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onMove: (paths: string[], destinationDir: string) => void;
  onExternalDrag: (paths: string[]) => void;
}

function ColumnFileItem({
  node,
  nodes,
  selectedPaths,
  onOpen,
  onSelectionChange,
  onContextMenu,
  renamingPath,
  renamingValue,
  renamingError,
  onRenameValueChange,
  onCommitRename,
  onCancelRename,
  onMove,
  onExternalDrag,
}: ColumnFileItemProps): React.JSX.Element {
  const { selected, isRenaming, dragProps, mouseProps, renameInputProps } = useFileItem({
    node,
    nodes,
    selectedPaths,
    renamingPath,
    renamingValue,
    onOpen,
    onSelectionChange,
    onContextMenu,
    onCommitRename,
    onCancelRename,
    onRenameValueChange,
    onMove,
    onExternalDrag,
  });

  return (
    <button
      data-file-item="true"
      type="button"
      {...dragProps}
      {...mouseProps}
      className={cn(
        'flex h-[var(--shell-row-height)] w-full items-center gap-2 px-3 text-left text-sm',
        selected ? 'bg-[color:var(--shell-accent)]/15' : 'hover:bg-shell-sidebar',
      )}
    >
      <FileIcon node={node} size={16} className={node.kind === 'directory' ? 'shrink-0 text-[color:var(--shell-accent)]' : 'shrink-0 text-current/70'} />
      {isRenaming ? (
        <input
          {...renameInputProps}
          aria-invalid={renamingError !== null}
          title={renamingError ?? undefined}
          className={cn(
            'h-6 min-w-0 flex-1 rounded border bg-shell-surface px-1 text-sm outline-none',
            renamingError === null ? 'border-[color:var(--shell-accent)]' : 'border-red-500',
          )}
        />
      ) : (
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
      )}
      {node.kind === 'directory' ? <ChevronRight size={14} className="shrink-0 text-current/40" /> : null}
    </button>
  );
}

export function FileColumnView({
  nodes,
  selectedPaths,
  onOpen,
  onSelectionChange,
  onContextMenu,
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
  const rowHeight = 32;
  const topOffset = 4;

  const calculateSelection = useCallback(
    (rect: SelectionRect) =>
      marqueeSelectionForList(nodes, rect, { rowHeight, topOffset }),
    [nodes]
  );

  const {
    marqueeRect,
    suppressNextClick: isMarqueeDragging,
    setSuppressNextClick,
    marqueeHandlers,
  } = useMarquee(onSelectionChange, calculateSelection);

  return (
    <div
      className="flex h-full overflow-auto"
      onClick={() => {
        if (isMarqueeDragging) {
          setSuppressNextClick(false);
          return;
        }
        onSelectionChange([]);
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
      <div
        className="relative w-72 shrink-0 border-r border-shell-border py-1"
        {...marqueeHandlers}
      >
        {nodes.map((node) => (
          <ColumnFileItem
            key={node.path}
            node={node}
            nodes={nodes}
            selectedPaths={selectedPaths}
            onOpen={onOpen}
            onSelectionChange={onSelectionChange}
            onContextMenu={onContextMenu}
            renamingPath={renamingPath}
            renamingValue={renamingValue}
            renamingError={renamingError}
            onRenameValueChange={onRenameValueChange}
            onCommitRename={onCommitRename}
            onCancelRename={onCancelRename}
            onMove={onMove}
            onExternalDrag={onExternalDrag}
          />
        ))}
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
      <div className="flex min-w-72 flex-1 items-center justify-center text-sm text-current/45">
        Select a folder to open the next column
      </div>
    </div>
  );
}
