import { useCallback } from 'react';
import { marqueeSelectionForList, type SelectionRect } from '../selection';
import type { FileViewProps } from '../types';
import { readDraggedPaths } from '../dragDrop';
import { useMarquee } from '@renderer/hooks';

import { ColumnFileItem } from './items/ColumnFileItem';

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
