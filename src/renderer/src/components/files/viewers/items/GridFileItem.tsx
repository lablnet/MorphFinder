import React from 'react';
import { cn } from '@lablnet/ui';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { FileIcon } from '../../../fileicons/FileIcon';
import { useFileItem } from '@renderer/hooks';
import { useAppStore } from '@renderer/store';
import type { GridItemData } from '../FileGrid';

export interface GridFileItemProps {
  node: FileSystemNode;
  data: GridItemData;
  style: React.CSSProperties;
}

export function GridFileItem({ node, data, style }: GridFileItemProps): React.JSX.Element {
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
  const gitColor = gitStatus
    ? {
        modified: 'bg-amber-500 ring-1 ring-white dark:ring-black',
        staged: 'bg-green-600 ring-1 ring-white dark:ring-black',
        added: 'bg-green-500 ring-1 ring-white dark:ring-black',
        untracked: 'bg-blue-500 ring-1 ring-white dark:ring-black',
        ignored: 'bg-gray-500 ring-1 ring-white dark:ring-black',
      }[gitStatus]
    : '';

  const annotations = useAppStore((state) => state.annotations);
  const annotation = annotations[node.path];
  const tags = annotation?.tags || [];

  return (
    <div style={style} className="p-1.5">
      <button
        data-file-item="true"
        type="button"
        title={`${node.name}${gitStatus ? ` (${gitStatus})` : ''}${tags.length > 0 ? ` [Tags: ${tags.map(t => t.label).join(', ')}]` : ''}`}
        {...dragProps}
        {...mouseProps}
        className={cn(
          'flex h-full w-full flex-col items-center justify-start gap-1 rounded-shell p-2 text-center text-xs outline-none relative transition-all',
          selected ? 'bg-[color:var(--shell-accent)]/15 ring-1 ring-[color:var(--shell-accent)]' : 'hover:bg-shell-sidebar',
          gitStatus === 'modified' && 'border border-amber-500/30 bg-amber-500/5',
          gitStatus === 'added' && 'border border-green-500/30 bg-green-500/5',
          gitStatus === 'untracked' && 'border border-blue-500/30 bg-blue-500/5',
        )}
      >
        <div className="relative">
          <FileIcon node={node} size={data.iconSize} className={node.kind === 'directory' ? 'text-[color:var(--shell-accent)]' : 'text-current/75'} />
          {gitColor && (
            <span className={cn('absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full', gitColor)} />
          )}
        </div>
        
        {/* Render tags as small colored dots/badges */}
        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-0.5 max-w-full my-0.5">
            {tags.map((t) => (
              <span
                key={t.id}
                className="h-1.5 w-1.5 rounded-full shrink-0 border border-black/10 dark:border-white/10"
                style={{ backgroundColor: t.color }}
                title={t.label}
              />
            ))}
          </div>
        )}

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
          <span className={cn(
            'line-clamp-2 w-full break-words',
            gitStatus === 'modified' && 'text-amber-600 dark:text-amber-400 font-medium',
            gitStatus === 'added' && 'text-green-600 dark:text-green-400 font-medium',
            gitStatus === 'untracked' && 'text-blue-600 dark:text-blue-400 font-medium',
            gitStatus === 'ignored' && 'text-current/30 line-through'
          )}>{node.name}</span>
        )}
      </button>
    </div>
  );
}
