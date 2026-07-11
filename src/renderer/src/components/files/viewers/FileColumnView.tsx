import React from 'react';
import { useAppStore } from '@renderer/store';
import { formatBytes, formatModifiedDate } from '@renderer/lib/format';
import { FileIcon } from '../../fileicons/FileIcon';
import type { FileSystemNode } from '@shared/types/fileSystem';
import type { FileViewProps } from '../types';
import { ColumnFileItem } from './items/ColumnFileItem';
import { useFileColumnView } from '@renderer/hooks';

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
  onMove,
  onExternalDrag,
}: FileViewProps): React.JSX.Element {
  const { columns, selectedNodeInLastCol, isFileSelectedInLastCol } = useFileColumnView({
    nodes,
    selectedPaths,
  });

  return (
    <div
      className="flex h-full overflow-x-auto overflow-y-hidden bg-shell-surface border-t border-shell-border"
      onClick={() => onSelectionChange([])}
      onContextMenu={(event) => onContextMenu(null, event)}
    >
      {columns.map((col) => (
        <div
          key={col.path}
          className="relative w-72 shrink-0 border-r border-shell-border py-1 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {col.nodes.map((node) => (
            <ColumnFileItem
              key={node.path}
              node={node}
              nodes={col.nodes}
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
        </div>
      ))}

      {/* Render the details preview column on the right when a file is selected */}
      {isFileSelectedInLastCol && selectedNodeInLastCol ? (
        <FilePreviewColumn node={selectedNodeInLastCol} />
      ) : (
        <div className="flex min-w-80 flex-1 items-center justify-center text-sm text-current/45">
          Select a folder to open the next column
        </div>
      )}
    </div>
  );
}

function FilePreviewColumn({ node }: { node: FileSystemNode }): React.JSX.Element {
  const annotations = useAppStore((state) => state.annotations);
  const annotation = annotations[node.path];
  const tags = annotation?.tags || [];

  return (
    <div
      className="flex min-w-80 flex-col items-center justify-center p-6 text-sm overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <FileIcon node={node} size={64} className="shrink-0 text-current/75" />
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-base break-all max-w-[260px]">{node.name}</span>
          <span className="capitalize text-xs text-current/55">{node.kind}</span>
        </div>
      </div>
      
      <div className="w-full mt-6 space-y-3 border-t border-shell-border pt-4 text-xs text-current/80">
        <div className="flex justify-between">
          <span className="text-current/50">Size</span>
          <span>{node.kind === 'directory' ? '--' : formatBytes(node.sizeInBytes)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-current/50">Modified</span>
          <span>{formatModifiedDate(node.modifiedAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-current/50">Created</span>
          <span>{formatModifiedDate(node.createdAt)}</span>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-2">
            <span className="text-current/50">Tags</span>
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium border text-current/90 shrink-0 select-none"
                  style={{ backgroundColor: `${t.color}15`, borderColor: t.color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
