import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSnapshotsSlice } from '@renderer/store/snapshots.slice';
import type { WorkspaceSnapshot } from '@shared/types/workspaceSnapshots';

vi.mock('@renderer/services/ipc', () => ({
  ipc: {
    invoke: vi.fn(),
  },
}));

import { ipc } from '@renderer/services/ipc';

describe('Snapshots Store Slice', () => {
  let storeState: Record<string, unknown>;

  const mockSet = (updater: unknown) => {
    const next = typeof updater === 'function' ? (updater as (state: unknown) => Record<string, unknown>)(storeState) : updater;
    storeState = { ...storeState, ...(next as Record<string, unknown>) };
  };

  const mockGet = () => storeState;

  beforeEach(() => {
    vi.clearAllMocks();
    storeState = {
      tabs: [
        { id: 'tab-1', path: '/foo', title: 'foo', history: { back: [], forward: [] }, viewMode: 'list', isPinned: false },
      ],
      activeTabId: 'tab-1',
      activeShell: 'finder',
      themeMode: 'dark',
      activeTab: () => (storeState.tabs as unknown[])[0],
      defaultViewModeForActiveShell: () => 'list',
      ...createSnapshotsSlice(mockSet, mockGet, {} as never),
    };
  });

  it('initializes with empty snapshots and modal closed', () => {
    expect(storeState.snapshots).toEqual([]);
    expect(storeState.isSnapshotsModalOpen).toBe(false);
  });

  it('loads snapshots via IPC', async () => {
    const dummySnapshots: WorkspaceSnapshot[] = [
      {
        id: 'snap-1',
        name: 'Project A',
        createdAt: '2026-07-22T00:00:00Z',
        updatedAt: '2026-07-22T00:00:00Z',
        tabs: [],
        activeTabPath: null,
        shell: 'finder',
        themeMode: 'dark',
      },
    ];

    vi.mocked(ipc.invoke).mockResolvedValueOnce(dummySnapshots as unknown as never);
    await (storeState as { loadSnapshots: () => Promise<void> }).loadSnapshots();

    expect(ipc.invoke).toHaveBeenCalledWith('snapshots:list', undefined);
    expect(storeState.snapshots).toEqual(dummySnapshots);
  });

  it('restores workspace snapshot into tabs and shell layout', () => {
    const targetSnapshot: WorkspaceSnapshot = {
      id: 'snap-1',
      name: 'Project B',
      createdAt: '2026-07-22T00:00:00Z',
      updatedAt: '2026-07-22T00:00:00Z',
      tabs: [
        { id: 'restored-1', path: '/project-b', title: 'project-b', history: { back: [], forward: [] }, viewMode: 'columns', isPinned: false },
      ],
      activeTabPath: '/project-b',
      shell: 'explorer',
      themeMode: 'light',
    };

    storeState.snapshots = [targetSnapshot];
    storeState.isSnapshotsModalOpen = true;

    storeState.restoreSnapshot('snap-1');

    expect(storeState.tabs).toEqual(targetSnapshot.tabs);
    expect(storeState.activeTabId).toBe('restored-1');
    expect(storeState.activeShell).toBe('explorer');
    expect(storeState.themeMode).toBe('light');
    expect(storeState.isSnapshotsModalOpen).toBe(false);
  });
});
