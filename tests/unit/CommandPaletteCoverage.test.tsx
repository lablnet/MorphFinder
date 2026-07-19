import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCommandPalette } from '../../src/renderer/src/hooks/ui/useCommandPalette';
import { useAppStore } from '../../src/renderer/src/store';
import type { FileSystemNode } from '../../src/shared/types/fileSystem';

const ipcState = vi.hoisted(() => ({
  invoke: vi.fn(),
  listeners: new Map<string, () => void>(),
}));

vi.mock('@renderer/services/ipc', () => ({
  ipc: {
    invoke: (...args: any[]) => ipcState.invoke(...args),
    on: (channel: string, listener: () => void) => {
      ipcState.listeners.set(channel, listener);
      return () => ipcState.listeners.delete(channel);
    },
  },
}));

const currentNodes: FileSystemNode[] = [
  { name: 'Alpha.txt', path: '/workspace/Alpha.txt', kind: 'file', sizeInBytes: 1, modifiedAt: 1, createdAt: 1 },
  { name: 'Projects', path: '/workspace/Projects', kind: 'directory', sizeInBytes: 0, modifiedAt: 2, createdAt: 1 },
];

function resetStore() {
  useAppStore.setState({
    activeShell: 'finder',
    themeMode: 'light',
    showHiddenFiles: false,
    wellKnownDirs: {
      home: '/home/me',
      desktop: '/home/me/Desktop',
      documents: '/home/me/Documents',
      downloads: '/home/me/Downloads',
    },
    tabs: [{
      id: 'tab-1',
      path: '/workspace',
      title: 'workspace',
      history: { back: [], forward: [] },
      viewMode: 'icons',
      isPinned: false,
    }],
    activeTabId: 'tab-1',
  } as any);
}

describe('useCommandPalette coverage targets', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    ipcState.listeners.clear();
    ipcState.invoke.mockResolvedValue({
      matches: [
        currentNodes[0],
        { name: 'Global.txt', path: '/workspace/deep/Global.txt', kind: 'file', sizeInBytes: 4, modifiedAt: 3, createdAt: 2 },
      ],
      scannedCount: 99,
      truncated: true,
    });
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('builds commands, toggles by shortcuts/ipc, searches globally, and runs actions', async () => {
    const onOpenNode = vi.fn();
    const onCreateFolder = vi.fn();
    const onRefresh = vi.fn();
    const onOpenOnboarding = vi.fn();
    const { result } = renderHook(() =>
      useCommandPalette({ currentNodes, onOpenNode, onCreateFolder, onRefresh, onOpenOnboarding }),
    );

    expect(result.current.isOpen).toBe(false);
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.filteredItems.map((item) => item.id)).toEqual(expect.arrayContaining([
      'nav-home',
      'act-new-tab',
      'act-close-tab',
      'act-refresh',
      'act-create-folder',
      'act-welcome-tour',
      'set-hidden-files',
      'node-/workspace/Alpha.txt',
    ]));

    act(() => result.current.setSearchQuery('Global'));
    await act(async () => {
      vi.advanceTimersByTime(221);
      await Promise.resolve();
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.filteredItems.some((item) => item.id === 'global-/workspace/deep/Global.txt')).toBe(true);
    expect(ipcState.invoke).toHaveBeenCalledWith('search:files', expect.objectContaining({
      rootPath: '/workspace',
      query: 'Global',
      includeHidden: false,
      maxResults: 30,
      maxDepth: 5,
    }));
    expect(result.current.filteredItems.some((item) => item.id === 'global-search-truncated')).toBe(true);

    act(() => result.current.selectItem(result.current.filteredItems.find((item) => item.id === 'global-/workspace/deep/Global.txt')!));
    expect(onOpenNode).toHaveBeenCalledWith(expect.objectContaining({ path: '/workspace/deep/Global.txt' }));
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.toggleOpen());
    act(() => result.current.selectItem(result.current.filteredItems.find((item) => item.id === 'nav-downloads')!));
    expect(useAppStore.getState().tabs.some((tab) => tab.path === '/home/me/Downloads')).toBe(true);

    act(() => result.current.toggleOpen());
    act(() => result.current.selectItem(result.current.filteredItems.find((item) => item.id === 'act-refresh')!));
    expect(onRefresh).toHaveBeenCalled();

    act(() => result.current.toggleOpen());
    act(() => result.current.selectItem(result.current.filteredItems.find((item) => item.id === 'act-create-folder')!));
    expect(onCreateFolder).toHaveBeenCalled();

    act(() => result.current.toggleOpen());
    act(() => result.current.selectItem(result.current.filteredItems.find((item) => item.id === 'act-welcome-tour')!));
    expect(onOpenOnboarding).toHaveBeenCalled();

    act(() => result.current.toggleOpen());
    act(() => result.current.selectItem(result.current.filteredItems.find((item) => item.id === 'set-hidden-files')!));
    expect(useAppStore.getState().showHiddenFiles).toBe(true);

    act(() => result.current.toggleOpen());
    act(() => result.current.selectItem(result.current.filteredItems.find((item) => item.id === 'set-shell-explorer')!));
    expect(useAppStore.getState().activeShell).toBe('explorer');

    act(() => result.current.toggleOpen());
    act(() => result.current.selectItem(result.current.filteredItems.find((item) => item.id === 'set-theme-dark')!));
    expect(useAppStore.getState().themeMode).toBe('dark');

    act(() => result.current.toggleOpen());
    act(() => result.current.selectIndex(1));
    expect(result.current.activeIndex).toBe(1);
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' })));
    expect(result.current.activeIndex).toBe(2);
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' })));
    expect(result.current.activeIndex).toBe(1);
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })));
    expect(result.current.isOpen).toBe(false);

    act(() => ipcState.listeners.get('command-palette:toggle')?.());
    expect(result.current.isOpen).toBe(true);
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
    expect(result.current.isOpen).toBe(false);
  });

  it('clears search for short, virtual, and failed global searches', async () => {
    const { result, rerender } = renderHook(({ nodes }) =>
      useCommandPalette({ currentNodes: nodes, onOpenNode: vi.fn() }),
      { initialProps: { nodes: currentNodes } },
    );

    act(() => result.current.toggleOpen());
    act(() => result.current.setSearchQuery('a'));
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });
    expect(ipcState.invoke).not.toHaveBeenCalled();

    useAppStore.setState({
      tabs: [{ ...useAppStore.getState().tabs[0]!, path: 'morph://space-analyzer' }],
    } as any);
    rerender({ nodes: currentNodes });
    act(() => result.current.setSearchQuery('space'));
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });
    expect(ipcState.invoke).not.toHaveBeenCalled();

    useAppStore.setState({
      tabs: [{ ...useAppStore.getState().tabs[0]!, path: '/workspace' }],
    } as any);
    ipcState.invoke.mockRejectedValueOnce(new Error('scan failed'));
    rerender({ nodes: [] });
    act(() => result.current.setSearchQuery('broken'));
    await act(async () => {
      vi.advanceTimersByTime(221);
      await Promise.resolve();
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.filteredItems.every((item) => item.category !== 'Global Search')).toBe(true);
  });
});
