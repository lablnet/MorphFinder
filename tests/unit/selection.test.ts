import { describe, expect, it } from 'vitest';
import {
  marqueeSelectionForGrid,
  nextSelectionForEvent,
  nextSelectionForKeyboard,
  normalizedSelectionRect,
} from '@renderer/components/files/selection';
import type { FileSystemNode } from '@shared/types/fileSystem';

function node(name: string): FileSystemNode {
  return {
    path: `/files/${name}`,
    name,
    kind: 'file',
    sizeInBytes: 1,
    modifiedAt: 1,
    createdAt: 1,
    isHidden: false,
    extension: 'txt',
  };
}

function event(modifiers: Partial<React.MouseEvent> = {}): React.MouseEvent {
  return {
    shiftKey: false,
    metaKey: false,
    ctrlKey: false,
    ...modifiers,
  } as React.MouseEvent;
}

describe('nextSelectionForEvent', () => {
  const nodes = [node('a'), node('b'), node('c'), node('d')];

  it('selects a single file on plain click', () => {
    expect(nextSelectionForEvent(nodes, new Set(['/files/a']), nodes[2], event())).toEqual(['/files/c']);
  });

  it('toggles entries on meta or ctrl click', () => {
    expect(nextSelectionForEvent(nodes, new Set(['/files/a']), nodes[2], event({ metaKey: true }))).toEqual([
      '/files/a',
      '/files/c',
    ]);
    expect(nextSelectionForEvent(nodes, new Set(['/files/a', '/files/c']), nodes[0], event({ ctrlKey: true }))).toEqual([
      '/files/c',
    ]);
  });

  it('selects an inclusive shift range from the latest selected path', () => {
    const selected = new Set(['/files/a', '/files/c']);

    expect(nextSelectionForEvent(nodes, selected, nodes[3], event({ shiftKey: true }))).toEqual(['/files/c', '/files/d']);
  });

  it('falls back to single selection when the range anchor is unavailable', () => {
    expect(nextSelectionForEvent(nodes, new Set(['/gone']), nodes[1], event({ shiftKey: true }))).toEqual(['/files/b']);
  });
});

describe('nextSelectionForKeyboard', () => {
  const nodes = [node('a'), node('b'), node('c'), node('d')];

  it('moves focus with arrow keys', () => {
    expect(nextSelectionForKeyboard(nodes, ['/files/b'], 'ArrowDown', { extend: false }).paths).toEqual(['/files/c']);
    expect(nextSelectionForKeyboard(nodes, ['/files/b'], 'ArrowUp', { extend: false }).paths).toEqual(['/files/a']);
  });

  it('uses configured columns for grid up and down movement', () => {
    expect(nextSelectionForKeyboard(nodes, ['/files/a'], 'ArrowDown', { extend: false, columns: 2 }).paths).toEqual(['/files/c']);
  });

  it('extends a range from the original anchor', () => {
    expect(nextSelectionForKeyboard(nodes, ['/files/b'], 'End', { extend: true }).paths).toEqual(['/files/b', '/files/c', '/files/d']);
  });
});

describe('marqueeSelectionForGrid', () => {
  const nodes = [node('a'), node('b'), node('c'), node('d')];

  it('normalizes drag coordinates regardless of direction', () => {
    expect(normalizedSelectionRect({ x: 120, y: 80 }, { x: 20, y: 10 })).toEqual({
      left: 20,
      top: 10,
      right: 120,
      bottom: 80,
    });
  });

  it('selects every grid item intersecting the marquee rectangle', () => {
    expect(
      marqueeSelectionForGrid(
        nodes,
        { left: 90, top: 10, right: 210, bottom: 110 },
        { columnCount: 2, columnWidth: 100, rowHeight: 100 },
      ),
    ).toEqual(['/files/a', '/files/b', '/files/c', '/files/d']);
  });

  it('returns no paths when the marquee misses all grid cells', () => {
    expect(
      marqueeSelectionForGrid(
        nodes,
        { left: 250, top: 250, right: 300, bottom: 300 },
        { columnCount: 2, columnWidth: 100, rowHeight: 100 },
      ),
    ).toEqual([]);
  });
});
