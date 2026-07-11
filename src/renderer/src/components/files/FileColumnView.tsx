import { ChevronRight } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { iconForNode } from './fileIcons';
import { nextSelectionForEvent } from './selection';
import type { FileViewProps } from './types';
import { pathsForDrag, readDraggedPaths, writeDraggedPaths } from './dragDrop';

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
  return (
    <div
      className="flex h-full overflow-auto"
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
      <div className="w-72 shrink-0 border-r border-shell-border py-1">
        {nodes.map((node) => {
          const Icon = iconForNode(node);
          const selected = selectedPaths.has(node.path);
          const isRenaming = renamingPath === node.path;

          return (
            <button
              key={node.path}
              type="button"
              draggable
              onDragStart={(event) => {
                const paths = pathsForDrag(node.path, selectedPaths);
                writeDraggedPaths(event.dataTransfer, paths);
                onExternalDrag(paths);
              }}
              onDragOver={(event) => {
                if (node.kind === 'directory') event.preventDefault();
              }}
              onDrop={(event) => {
                if (node.kind !== 'directory') return;
                event.preventDefault();
                event.stopPropagation();
                const paths = readDraggedPaths(event.dataTransfer).filter((path) => path !== node.path);
                if (paths.length > 0) onMove(paths, node.path);
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelectionChange(nextSelectionForEvent(nodes, selectedPaths, node, event), node.path);
              }}
              onDoubleClick={() => {
                if (!isRenaming) onOpen(node);
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (event.ctrlKey) {
                  onSelectionChange(nextSelectionForEvent(nodes, selectedPaths, node, event), node.path);
                  return;
                }
                if (!selectedPaths.has(node.path)) onSelectionChange([node.path], node.path);
                onContextMenu(node, event);
              }}
              className={cn(
                'flex h-[var(--shell-row-height)] w-full items-center gap-2 px-3 text-left text-sm',
                selected ? 'bg-[color:var(--shell-accent)]/15' : 'hover:bg-shell-sidebar',
              )}
            >
              <Icon size={16} className={node.kind === 'directory' ? 'shrink-0 text-[color:var(--shell-accent)]' : 'shrink-0 text-current/70'} />
              {isRenaming ? (
                <input
                  autoFocus
                  value={renamingValue}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => onRenameValueChange(event.target.value)}
                  onFocus={(event) => event.currentTarget.select()}
                  onBlur={onCommitRename}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      event.stopPropagation();
                      onCommitRename();
                    }
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      event.stopPropagation();
                      onCancelRename();
                    }
                  }}
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
        })}
      </div>
      <div className="flex min-w-72 flex-1 items-center justify-center text-sm text-current/45">
        Select a folder to open the next column
      </div>
    </div>
  );
}
