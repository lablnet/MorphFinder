import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppStore } from '../../src/renderer/src/store';
import { ipc } from '../../src/renderer/src/services/ipc';

vi.mock('../../src/renderer/src/services/ipc', () => ({
  ipc: {
    invoke: vi.fn().mockImplementation((channel, req) => {
      if (channel === 'snapshots:list') {
        return Promise.resolve([
          {
            id: 'snap-1',
            name: 'Default Snapshot',
            tabs: [{ id: 'tab-1', path: '/home', history: ['/home'], historyIndex: 0 }],
            activeTabPath: '/home',
            shell: 'finder',
            themeMode: 'dark',
            createdAt: 1000,
            updatedAt: 1000,
          },
        ]);
      }
      if (channel === 'snapshots:save') {
        return Promise.resolve({ id: 'snap-2', name: req.name, tabs: req.tabs, activeTabPath: req.activeTabPath, shell: req.shell, themeMode: req.themeMode, createdAt: 2000, updatedAt: 2000 });
      }
      if (channel === 'snapshots:export') return Promise.resolve(true);
      if (channel === 'snapshots:import') {
        return Promise.resolve({ id: 'snap-imported', name: 'Imported', tabs: [], activeTabPath: null, shell: 'explorer', themeMode: 'light', createdAt: 3000, updatedAt: 3000 });
      }
      return Promise.resolve({});
    }),
  },
}));

describe('Snapshots and Layout Store Slices Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('snapshots slice: load, save, restore, delete, export, import', async () => {
    const store = useAppStore.getState();

    store.setSnapshotsModalOpen(true);
    expect(useAppStore.getState().isSnapshotsModalOpen).toBe(true);

    await store.loadSnapshots();
    expect(useAppStore.getState().snapshots.length).toBe(1);
    expect(useAppStore.getState().snapshots[0].id).toBe('snap-1');

    await store.saveCurrentWorkspace('My Workspace', 'Description test');
    expect(ipc.invoke).toHaveBeenCalledWith('snapshots:save', expect.objectContaining({ name: 'My Workspace', description: 'Description test' }));

    store.restoreSnapshot('snap-1');
    expect(useAppStore.getState().activeShell).toBe('finder');
    expect(useAppStore.getState().isSnapshotsModalOpen).toBe(false);

    await store.exportSnapshot('snap-1');
    expect(ipc.invoke).toHaveBeenCalledWith('snapshots:export', { snapshotId: 'snap-1' });

    await store.deleteSnapshot('snap-1');
    expect(ipc.invoke).toHaveBeenCalledWith('snapshots:delete', { id: 'snap-1' });

    const imported = await store.importSnapshot();
    expect(imported?.id).toBe('snap-imported');
  });

  it('layout slice: shell, theme, hidden files, terminal, pin folders, annotations', () => {
    const store = useAppStore.getState();

    store.setShell('dolphin');
    expect(useAppStore.getState().activeShell).toBe('dolphin');

    store.cycleShell();
    expect(useAppStore.getState().activeShell).toBe('finder');

    store.setThemeMode('dark');
    expect(useAppStore.getState().themeMode).toBe('dark');

    store.toggleHiddenFiles();
    expect(useAppStore.getState().showHiddenFiles).toBe(true);

    store.setTerminalOpen(true);
    expect(useAppStore.getState().terminalOpen).toBe(true);

    store.setTerminalHeight(400);
    expect(useAppStore.getState().terminalHeight).toBe(400);

    store.pinFolder('/tmp/folder');
    expect(useAppStore.getState().pinnedFolders).toContain('/tmp/folder');

    store.unpinFolder('/tmp/folder');
    expect(useAppStore.getState().pinnedFolders).not.toContain('/tmp/folder');
  });
});
