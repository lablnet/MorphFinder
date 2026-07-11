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

  const columnsRef = useRef<ColumnState[]>([]);
  columnsRef.current = columns;

  useEffect(() => {
    if (currentPath) {
      setColumns([{ path: currentPath, nodes }]);
    }
  }, [currentPath, nodes]);

  useEffect(() => {
    let active = true;

    async function syncColumns() {
      const currentCols = columnsRef.current;
      if (currentCols.length === 0) return;

      for (let i = 0; i < currentCols.length; i++) {
        const col = currentCols[i];
        if (!col) continue;
        const selectedNode = col.nodes.find((n) => selectedPaths.has(n.path));

        if (selectedNode && selectedNode.kind === 'directory') {
          const nextCol = currentCols[i + 1];
          if (!nextCol || nextCol.path !== selectedNode.path) {
            try {
              const listing = await ipc.invoke('fs:readDirectory', {
                path: selectedNode.path,
                includeHidden: showHidden,
              });
              if (!active) return;

              setColumns((prev) => {
                const next = prev.slice(0, i + 1);
                next.push({ path: selectedNode.path, nodes: listing.nodes });
                return next;
              });
            } catch (err) {
              console.error('Failed to load column directory:', err);
            }
            break;
          }
        } else {
          if (currentCols.length > i + 1) {
            setColumns((prev) => prev.slice(0, i + 1));
            break;
          }
        }
      }
    }

    void syncColumns();

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
