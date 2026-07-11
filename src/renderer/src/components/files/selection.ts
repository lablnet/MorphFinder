import type { FileSystemNode } from '@shared/types/fileSystem';

export function nextSelectionForEvent(
  nodes: FileSystemNode[],
  selectedPaths: ReadonlySet<string>,
  node: FileSystemNode,
  event: React.MouseEvent,
): string[] {
  if (event.shiftKey && selectedPaths.size > 0) {
    const selected = [...selectedPaths];
    const anchorIndex = nodes.findIndex((entry) => entry.path === selected[selected.length - 1]);
    const targetIndex = nodes.findIndex((entry) => entry.path === node.path);
    if (anchorIndex >= 0 && targetIndex >= 0) {
      const [start, end] = anchorIndex < targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex];
      return nodes.slice(start, end + 1).map((entry) => entry.path);
    }
  }

  if (event.metaKey || event.ctrlKey) {
    const next = new Set(selectedPaths);
    if (next.has(node.path)) next.delete(node.path);
    else next.add(node.path);
    return [...next];
  }

  return [node.path];
}

export type SelectionNavigationKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End';

export interface SelectionRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface MarqueeGridLayout {
  columnCount: number;
  columnWidth: number;
  rowHeight: number;
}

function intersects(a: SelectionRect, b: SelectionRect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function normalizedSelectionRect(start: { x: number; y: number }, end: { x: number; y: number }): SelectionRect {
  return {
    left: Math.min(start.x, end.x),
    top: Math.min(start.y, end.y),
    right: Math.max(start.x, end.x),
    bottom: Math.max(start.y, end.y),
  };
}

export function marqueeSelectionForGrid(
  nodes: FileSystemNode[],
  rect: SelectionRect,
  layout: MarqueeGridLayout,
): string[] {
  if (layout.columnCount <= 0) return [];

  return nodes
    .filter((_, index) => {
      const column = index % layout.columnCount;
      const row = Math.floor(index / layout.columnCount);
      return intersects(rect, {
        left: column * layout.columnWidth,
        top: row * layout.rowHeight,
        right: (column + 1) * layout.columnWidth,
        bottom: (row + 1) * layout.rowHeight,
      });
    })
    .map((node) => node.path);
}

export function nextSelectionForKeyboard(
  nodes: FileSystemNode[],
  selectedPaths: readonly string[],
  key: SelectionNavigationKey,
  options: { extend: boolean; columns?: number },
): { paths: string[]; anchorPath: string | undefined } {
  if (nodes.length === 0) return { paths: [], anchorPath: undefined };

  const columns = Math.max(1, options.columns ?? 1);
  const paths = nodes.map((node) => node.path);
  const focusedPath = selectedPaths.at(-1);
  const focusedIndex = Math.max(0, focusedPath === undefined ? 0 : paths.indexOf(focusedPath));
  const currentIndex = focusedIndex === -1 ? 0 : focusedIndex;

  const nextIndex = (() => {
    if (key === 'Home') return 0;
    if (key === 'End') return paths.length - 1;
    if (key === 'ArrowUp') return Math.max(0, currentIndex - columns);
    if (key === 'ArrowDown') return Math.min(paths.length - 1, currentIndex + columns);
    if (key === 'ArrowLeft') return Math.max(0, currentIndex - 1);
    return Math.min(paths.length - 1, currentIndex + 1);
  })();

  const nextPath = paths[nextIndex];
  if (nextPath === undefined) return { paths: [], anchorPath: undefined };

  if (!options.extend || selectedPaths.length === 0) return { paths: [nextPath], anchorPath: nextPath };

  const anchorPath = selectedPaths[0] ?? nextPath;
  const anchorIndex = paths.indexOf(anchorPath);
  if (anchorIndex === -1) return { paths: [nextPath], anchorPath: nextPath };

  const [start, end] = anchorIndex < nextIndex ? [anchorIndex, nextIndex] : [nextIndex, anchorIndex];
  return { paths: paths.slice(start, end + 1), anchorPath };
}
