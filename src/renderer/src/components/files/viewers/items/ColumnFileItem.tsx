import React from 'react';
import { cn } from '@lablnet/ui';
import { ChevronRight } from 'lucide-react';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { FileIcon } from '../../../fileicons/FileIcon';
import { useFileItem } from '@renderer/hooks';
import { useAppStore } from '@renderer/store';

export interface ColumnFileItemProps {
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

export function ColumnFileItem({
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

  const annotations = useAppStore((state) => state.annotations);
  const annotation = annotations[node.path];
  const tags = annotation?.tags || [];

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
        <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
          <span className="min-w-0 flex-1 truncate">{node.name}</span>
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
      {node.kind === 'directory' ? <ChevronRight size={14} className="shrink-0 text-current/40" /> : null}
    </button>
  );
}
