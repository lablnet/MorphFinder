import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDuplicateFinder } from '../../src/renderer/src/hooks/duplicates/useDuplicateFinder';
import { useCacheCleaner } from '../../src/renderer/src/hooks/files/useCacheCleaner';
import { useFileTimeline } from '../../src/renderer/src/hooks/files/useFileTimeline';
import { useGitRadar } from '../../src/renderer/src/hooks/git/useGitRadar';
import { useWorkspaceSnapshots } from '../../src/renderer/src/hooks/snapshots/useWorkspaceSnapshots';
import { useSpaceAnalyzer } from '../../src/renderer/src/hooks/spaceanalyzer/useSpaceAnalyzer';
import { useTerminal } from '../../src/renderer/src/hooks/ui/useTerminal';
import { useAppStore } from '../../src/renderer/src/store';

const ipcState = vi.hoisted(() => ({
  handlers: new Map<string, (payload: any) => void>(),
  invoke: vi.fn(),
  on: vi.fn((channel: string, handler: (payload: any) => void) => {
    ipcState.handlers.set(channel, handler);
    return vi.fn(() => ipcState.handlers.delete(channel));
  }),
}));

vi.mock('@renderer/services/ipc', () => ({
  ipc: {
    invoke: (...args: any[]) => ipcState.invoke(...args),
    on: (...args: any[]) => ipcState.on(...args),
  },
}));

const duplicateGroup = {
  id: 'g1',
  hash: 'abc',
  sizeInBytes: 100,
  files: [
    { path: '/repo/new.txt', name: 'new.txt', sizeInBytes: 100, modifiedAt: 20, hash: 'abc' },
    { path: '/repo/old.txt', name: 'old.txt', sizeInBytes: 100, modifiedAt: 10, hash: 'abc' },
  ],
};

const analyzerRoot = {
  id: '/repo',
  name: 'repo',
  path: '/repo',
  size: 300,
  isDirectory: true,
  fileCount: 2,
  children: [
    { id: '/repo/src', name: 'src', path: '/repo/src', size: 200, isDirectory: true, fileCount: 1, children: [] },
  ],
};

function resetHooks() {
  vi.clearAllMocks();
  ipcState.handlers.clear();
  ipcState.invoke.mockReset();
  useAppStore.setState({
    wellKnownDirs: { home: '/home', desktop: '/desktop', documents: '/docs', downloads: '/downloads' },
    showHiddenFiles: false,
    terminalOpen: false,
    terminalHeight: 240,
    terminalQueuedCommand: null,
    tabs: [{ id: 'tab-1', path: '/repo', title: 'repo', history: ['/repo'], historyIndex: 0, viewMode: 'icons' }],
    activeTabId: 'tab-1',
    snapshots: [],
    isSnapshotsLoading: false,
    isSnapshotsModalOpen: false,
  } as any);
}

describe('hook coverage', () => {
  beforeEach(resetHooks);

  it('scans timeline, chooses folders, and reports errors', async () => {
    ipcState.invoke.mockImplementation(async (channel, payload) => {
      if (channel === 'timeline:scan') return { rootPath: payload.rootPath, days: payload.days, items: [{ path: '/home/a.ts', name: 'a.ts', sizeInBytes: 1, modifiedAt: Date.now(), createdAt: Date.now(), eventAt: Date.now(), eventKind: 'created' }] };
      if (channel === 'shell:selectFolder') return '/chosen';
      return null;
    });

    const { result } = renderHook(() => useFileTimeline(null));
    await act(async () => result.current.scan());
    expect(ipcState.invoke).toHaveBeenCalledWith('timeline:scan', expect.objectContaining({ rootPath: '/home', includeHidden: false }));
    expect(result.current.groups.length).toBe(1);

    await act(async () => result.current.chooseFolder());
    expect(result.current.rootPath).toBe('/chosen');

    ipcState.invoke.mockRejectedValueOnce(new Error('scan failed'));
    await act(async () => result.current.scan());
    expect(result.current.error).toBe('scan failed');
  });

  it('handles duplicate finder scan, progress, selection, folder choice, stop, and trash', async () => {
    ipcState.invoke.mockImplementation(async (channel) => {
      if (channel === 'duplicates:scan') return { groups: [duplicateGroup], scannedCount: 5, hashedCount: 2, truncated: false };
      if (channel === 'shell:selectFolder') return '/custom';
      if (channel === 'shell:trash') return undefined;
      return undefined;
    });

    const { result } = renderHook(() => useDuplicateFinder());
    await act(async () => result.current.scan());
    expect(result.current.groups).toHaveLength(1);

    act(() => result.current.keepNewest());
    expect(result.current.selectedPaths.has('/repo/old.txt')).toBe(true);
    expect(result.current.selectedBytes).toBe(100);

    act(() => result.current.togglePath('/repo/new.txt'));
    expect(result.current.selectedPaths.has('/repo/new.txt')).toBe(true);

    await act(async () => result.current.chooseFolder());
    expect(result.current.scanScope).toBe('custom');
    expect(result.current.customFolder).toBe('/custom');

    await act(async () => result.current.stopScan());
    expect(result.current.message).toBe('Duplicate scan stopped.');

    await act(async () => result.current.trashSelected());
    expect(ipcState.invoke).toHaveBeenCalledWith('shell:trash', expect.objectContaining({ paths: expect.arrayContaining(['/repo/new.txt']) }));

    act(() => ipcState.handlers.get('duplicates:progress')?.({ phase: 'hashing', scannedCount: 6, hashedCount: 3, groupsFound: 1, currentPath: '/repo/a', groups: [duplicateGroup] }));
  });

  it('refreshes git radar for repo, non-repo, virtual, events, and errors', async () => {
    ipcState.invoke.mockImplementation(async (channel) => {
      if (channel === 'git:status') return { isRepo: true, branch: 'main', isDirty: false, ahead: 0, behind: 0, statusMap: {} };
      if (channel === 'git:history') return [{ hash: 'abc', message: 'init', author: 'Ada', date: 1 }];
      return null;
    });

    const { result, rerender } = renderHook(({ path }) => useGitRadar(path), { initialProps: { path: '/repo' as string | null } });
    await waitFor(() => expect(result.current.gitHistory).toHaveLength(1));

    act(() => result.current.toggleOpen());
    expect(result.current.isOpen).toBe(true);

    act(() => ipcState.handlers.get('fs:changed')?.({ path: '/repo' }));
    await waitFor(() => expect(ipcState.invoke).toHaveBeenCalledWith('git:status', { path: '/repo' }));

    ipcState.invoke.mockImplementationOnce(async () => ({ isRepo: false, statusMap: {} }));
    await act(async () => result.current.refresh());
    expect(result.current.gitHistory).toEqual([]);

    rerender({ path: 'morph://cache' });
    await waitFor(() => expect(result.current.gitStatus).toBeNull());

    rerender({ path: '/broken' });
    ipcState.invoke.mockRejectedValueOnce(new Error('git failed'));
    await act(async () => result.current.refresh());
    expect(result.current.error).toBe('git failed');
  });

  it('loads and exposes workspace snapshots store actions', async () => {
    const loadSnapshots = vi.fn(async () => undefined);
    const saveCurrentWorkspace = vi.fn(async () => undefined);
    const restoreSnapshot = vi.fn();
    const deleteSnapshot = vi.fn();
    const exportSnapshot = vi.fn();
    const importSnapshot = vi.fn(async () => undefined);
    useAppStore.setState({ loadSnapshots, saveCurrentWorkspace, restoreSnapshot, deleteSnapshot, exportSnapshot, importSnapshot } as any);

    const { result } = renderHook(() => useWorkspaceSnapshots());
    await waitFor(() => expect(loadSnapshots).toHaveBeenCalledTimes(1));
    act(() => result.current.openModal());
    expect(useAppStore.getState().isSnapshotsModalOpen).toBe(true);
    act(() => result.current.closeModal());
    expect(useAppStore.getState().isSnapshotsModalOpen).toBe(false);
    await result.current.saveCurrentWorkspace('name');
    result.current.restoreSnapshot('id');
    result.current.deleteSnapshot('id');
    result.current.exportSnapshot('id');
    await result.current.importSnapshot();
    expect(saveCurrentWorkspace).toHaveBeenCalledWith('name');
  });

  it('drives space analyzer scan, progress, navigation, cancel, browse, and errors', async () => {
    ipcState.invoke.mockImplementation(async (channel) => {
      if (channel === 'analyzer:scan') return { rootNode: analyzerRoot, diskTotal: 1000, diskFree: 400 };
      if (channel === 'shell:selectFolder') return '/picked';
      return undefined;
    });

    const { result } = renderHook(() => useSpaceAnalyzer());
    act(() => ipcState.handlers.get('analyzer:progress')?.({ fileCount: 3, size: 50, scannedPath: '/repo/file' }));
    expect(result.current.progress.fileCount).toBe(3);

    await act(async () => result.current.triggerScan('/repo'));
    expect(result.current.scanResult?.path).toBe('/repo');
    act(() => result.current.drillDown(analyzerRoot.children![0]!));
    expect(result.current.viewedPath).toBe('/repo/src');
    act(() => result.current.navigateUp());
    expect(result.current.viewedPath).toBe('/repo');
    act(() => result.current.toggleViewMode());
    expect(result.current.viewMode).toBe('donut');
    act(() => result.current.setSelectedPath('/repo/src'));
    expect(result.current.selectedPath).toBe('/repo/src');

    await act(async () => result.current.browseFolder());
    expect(result.current.currentPathInput).toBe('/picked');
    await act(async () => result.current.cancelScan());
    expect(result.current.scanError).toBe('Scan cancelled by user.');

    ipcState.invoke.mockRejectedValueOnce(new Error('no disk'));
    await act(async () => result.current.triggerScan('/bad'));
    expect(result.current.scanError).toBe('no disk');
  });

  it('runs terminal session lifecycle and cache cleaner flows', async () => {
    ipcState.invoke.mockImplementation(async (channel, payload) => {
      if (channel === 'terminal:create') return { id: 'term-1' };
      if (channel === 'cache:scan') return {
        isSupported: true,
        targets: [
          { id: 'dev', name: 'Dev Cache', description: 'cache', path: '/cache/dev', sizeInBytes: 1024, category: 'Developer' },
          { id: 'app', name: 'App Cache', description: 'app', path: '/cache/app', sizeInBytes: 2048, category: 'Application' },
        ],
      };
      if (channel === 'cache:clean') return { cleanedSizes: { [payload.targetIds[0]]: 1024 }, errors: {} };
      return undefined;
    });

    useAppStore.setState({ terminalOpen: true, terminalQueuedCommand: { nonce: 1, cwd: '/repo', command: 'pnpm test' } } as any);
    const terminal = renderHook(() => useTerminal());
    await waitFor(() => expect(ipcState.invoke).toHaveBeenCalledWith('terminal:create', { cwd: '/repo' }));
    act(() => ipcState.handlers.get('terminal:data')?.({ id: 'term-1', data: 'hello' }));
    expect(terminal.result.current.output).toContain('hello');
    act(() => terminal.result.current.writeData('ls\n'));
    act(() => terminal.result.current.resizeSession(80, 24));
    await act(async () => terminal.result.current.restart());
    expect(terminal.result.current.output).toContain('Restarted');
    act(() => ipcState.handlers.get('terminal:exit')?.({ id: 'term-1', exitCode: 0 }));
    expect(terminal.result.current.output).toContain('Process exited');

    const cache = renderHook(() => useCacheCleaner());
    await waitFor(() => expect(cache.result.current.targets).toHaveLength(2));
    await waitFor(() => expect(cache.result.current.selectedIds.size).toBeGreaterThan(0));
    act(() => cache.result.current.setSearchQuery('app'));
    expect(cache.result.current.sortedTargets[0]!.id).toBe('app');
    act(() => cache.result.current.handleToggleSelect('app'));
    expect(cache.result.current.hasApplicationSupportSelected).toBe(true);
    await act(async () => {
      await cache.result.current.handleClean();
    });
    expect(ipcState.invoke).toHaveBeenCalledWith('cache:clean', { targetIds: ['dev'] });
  });
});
