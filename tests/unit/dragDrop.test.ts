import { describe, expect, it, vi } from 'vitest';
import { MORPH_FILE_PATHS_TYPE, pathsForDrag, readDraggedPaths, writeDraggedPaths } from '../../src/renderer/src/components/files/dragDrop';

function transfer(initial: Record<string, string> = {}): DataTransfer {
  const values = new Map(Object.entries(initial));
  return {
    effectAllowed: 'uninitialized',
    setData: vi.fn((type: string, value: string) => values.set(type, value)),
    getData: vi.fn((type: string) => values.get(type) ?? ''),
  } as unknown as DataTransfer;
}

describe('drag and drop payloads', () => {
  it('drags the whole selection when the source is selected', () => {
    expect(pathsForDrag('/a', new Set(['/a', '/b']))).toEqual(['/a', '/b']);
  });

  it('drags only an unselected source', () => {
    expect(pathsForDrag('/c', new Set(['/a', '/b']))).toEqual(['/c']);
  });

  it('writes and reads the private path payload', () => {
    const data = transfer();
    writeDraggedPaths(data, ['/a', '/b']);
    expect(data.effectAllowed).toBe('move');
    expect(readDraggedPaths(data)).toEqual(['/a', '/b']);
  });

  it('falls back to text and rejects malformed payloads', () => {
    expect(readDraggedPaths(transfer({ 'text/plain': '["/a"]' }))).toEqual(['/a']);
    expect(readDraggedPaths(transfer({ [MORPH_FILE_PATHS_TYPE]: '{bad' }))).toEqual([]);
    expect(readDraggedPaths(transfer({ [MORPH_FILE_PATHS_TYPE]: '[1]' }))).toEqual([]);
  });
});
