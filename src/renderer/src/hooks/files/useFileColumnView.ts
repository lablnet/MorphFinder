import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@renderer/store';
import { ipc } from '@renderer/services/ipc';
import type { FileSystemNode } from '@shared/types/fileSystem';

export interface ColumnState {
  path: string;
  nodes: FileSystemNode[];
}

export interface UseFileColumnViewOptions {
  nodes: FileSystemNode[];
  selectedPaths: ReadonlySet<string>;
}

export function useFileColumnView({ nodes, selectedPaths }: UseFileColumnViewOptions) {
  const currentPath = useAppStore((state) => state.activeTab()?.path ?? null);
  const showHidden = useAppStore((state) => state.showHiddenFiles);
  const [columns, setColumns] = useState<ColumnState[]>([]);

  // Keep a ref to the columns state so the selection effect can access the latest
  // columns stack without triggering infinite hook evaluation cycles.
  const columnsRef = useRef<ColumnState[]>([]);
  columnsRef.current = columns;

  // Initialize and update the first column when currentPath or nodes change.
  useEffect(() => {
    if (currentPath) {
      setColumns((prev) => {
        // If the first column is already tracking currentPath, just update its nodes
        // to prevent resetting and collapsing the deeper column stack on watcher updates.
        if (prev.length > 0 && prev[0]?.path === currentPath) {
          const next = [...prev];
          next[0] = { path: currentPath, nodes };
          return next;
        } else {
          // Otherwise, reset the stack to start from the new folder location.
          return [{ path: currentPath, nodes }];
        }
      });
    }
  }, [currentPath, nodes]);

  // Synchronize column stack with selection changes.
  useEffect(() => {
    let active = true;

    async function handleSelectionChange() {
      if (selectedPaths.size === 0) {
        setColumns((prev) => (prev.length > 1 ? prev.slice(0, 1) : prev));
        return;
      }

      // Find the last selected path in the set
      const selectedList = Array.from(selectedPaths);
      const targetPath = selectedList[selectedList.length - 1];
      if (!targetPath) return;

      const currentCols = columnsRef.current;
      
      // Locate which column index contains the clicked target path
      let colIndex = -1;
      let targetNode: FileSystemNode | undefined;

      for (let i = 0; i < currentCols.length; i++) {
        const col = currentCols[i];
        if (!col) continue;
        const found = col.nodes.find((n) => n.path === targetPath);
        if (found) {
          colIndex = i;
          targetNode = found;
          break;
        }
      }

      // If selection is not in any active column (e.g., initialized externally), ignore
      if (colIndex === -1 || !targetNode) {
        return;
      }

      if (targetNode.kind === 'directory') {
        const nextCol = currentCols[colIndex + 1];
        if (!nextCol || nextCol.path !== targetNode.path) {
          try {
            const listing = await ipc.invoke('fs:readDirectory', {
              path: targetNode.path,
              includeHidden: showHidden,
            });
            if (!active) return;

            setColumns((prev) => {
              const next = prev.slice(0, colIndex + 1);
              next.push({ path: targetNode.path, nodes: listing.nodes });
              return next;
            });
          } catch (err) {
            console.error('Failed to load column directory:', err);
          }
        } else {
          // If the next column already exists but there are columns further to the right, collapse them
          if (currentCols.length > colIndex + 2) {
            setColumns((prev) => prev.slice(0, colIndex + 2));
          }
        }
      } else {
        // If a file is selected, collapse any columns to the right of this column
        if (currentCols.length > colIndex + 1) {
          setColumns((prev) => prev.slice(0, colIndex + 1));
        }
      }
    }

    void handleSelectionChange();

    return () => {
      active = false;
    };
  }, [selectedPaths, showHidden]);

  const lastColumn = columns[columns.length - 1] ?? null;
  const selectedNodeInLastCol = lastColumn
    ? lastColumn.nodes.find((n) => selectedPaths.has(n.path)) ?? null
    : null;
  const isFileSelectedInLastCol = selectedNodeInLastCol && selectedNodeInLastCol.kind !== 'directory';

  return {
    columns,
    selectedNodeInLastCol,
    isFileSelectedInLastCol,
  };
}
