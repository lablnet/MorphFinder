import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileSystemController } from '../../src/renderer/src/hooks/files/useFileSystemController';
import { useAppStore } from '../../src/renderer/src/store';

vi.mock('../../src/renderer/src/services/ipc', () => ({
  ipc: {
    invoke: vi.fn().mockImplementation((channel) => {
      if (channel === 'annotations:list') return Promise.resolve([]);
      if (channel === 'fs:readDirectory') return Promise.resolve({ nodes: [] });
      if (channel === 'fs:rename') return Promise.resolve({ name: 'renamed' });
      if (channel === 'fs:createFolder') return Promise.resolve({ name: 'newfolder' });
      return Promise.resolve({});
    }),
    on: vi.fn().mockReturnValue(() => {}),
  },
}));

describe('useFileSystemController Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders and exposes controller methods', async () => {
    useAppStore.setState({
      activeTabId: 'tab1',
      tabs: [{ id: 'tab1', title: 'Home', path: '/tmp', history: { back: [], forward: [] } }],
    });

    const { result } = renderHook(() => useFileSystemController());

    expect(result.current.statusText).toBeDefined();

    // Trigger context menu actions
    act(() => {
      result.current.openContextMenu(
        { path: '/tmp/file.txt', name: 'file.txt', kind: 'file', sizeInBytes: 10, modifiedAt: 1, createdAt: 1, isHidden: false, extension: 'txt' },
        { preventDefault: vi.fn(), clientX: 100, clientY: 100 } as any
      );
    });

    expect(result.current.contextMenu).toBeDefined();

    act(() => {
      result.current.runContextAction('copy');
    });

    act(() => {
      result.current.runContextAction('refresh');
    });

    act(() => {
      result.current.closeContextMenu();
    });

    expect(result.current.contextMenu).toBeNull();
  });
});
