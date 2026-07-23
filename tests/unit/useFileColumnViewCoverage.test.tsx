import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileColumnView } from '../../src/renderer/src/hooks/files/useFileColumnView';
import { useAppStore } from '../../src/renderer/src/store';

vi.mock('../../src/renderer/src/services/ipc', () => ({
  ipc: {
    invoke: vi.fn().mockImplementation((channel) => {
      if (channel === 'fs:readDirectory') {
        return Promise.resolve({
          nodes: [
            { path: '/tmp/dir/file.txt', name: 'file.txt', kind: 'file' as const, sizeInBytes: 10, modifiedAt: 1, createdAt: 1, isHidden: false, extension: 'txt' },
          ],
        });
      }
      return Promise.resolve({});
    }),
    on: vi.fn().mockReturnValue(() => {}),
  },
}));

describe('useFileColumnView Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('manages column stacks for directory and file selections', async () => {
    useAppStore.setState({
      activeTabId: 'tab1',
      tabs: [{ id: 'tab1', title: 'Home', path: '/tmp', history: { back: [], forward: [] } }],
    });

    const nodes = [
      { path: '/tmp/dir', name: 'dir', kind: 'directory' as const, sizeInBytes: 0, modifiedAt: 1, createdAt: 1, isHidden: false, extension: '' },
      { path: '/tmp/file.txt', name: 'file.txt', kind: 'file' as const, sizeInBytes: 10, modifiedAt: 1, createdAt: 1, isHidden: false, extension: 'txt' },
    ];

    const { result, rerender } = renderHook(
      ({ selected }) => useFileColumnView({ nodes, selectedPaths: selected }),
      { initialProps: { selected: new Set<string>() } }
    );

    expect(result.current.columns.length).toBe(1);

    // Select directory
    await act(async () => {
      rerender({ selected: new Set(['/tmp/dir']) });
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(result.current.columns.length).toBe(2);

    // Select file in top nodes
    await act(async () => {
      rerender({ selected: new Set(['/tmp/file.txt']) });
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(result.current.columns.length).toBe(1);
    expect(result.current.isFileSelectedInLastCol).toBe(true);

    // Clear selection
    await act(async () => {
      rerender({ selected: new Set<string>() });
      await new Promise((r) => setTimeout(r, 20));
    });
  });
});
