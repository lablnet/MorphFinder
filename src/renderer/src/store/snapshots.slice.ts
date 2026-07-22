import type { StateCreator } from 'zustand';
import type { WorkspaceSnapshot } from '@shared/types/workspaceSnapshots';
import { ipc } from '../services/ipc';
import type { AppStore } from './index';

export interface SnapshotsSlice {
  snapshots: WorkspaceSnapshot[];
  isSnapshotsLoading: boolean;
  isSnapshotsModalOpen: boolean;
  setSnapshotsModalOpen: (open: boolean) => void;
  loadSnapshots: () => Promise<void>;
  saveCurrentWorkspace: (name: string, description?: string) => Promise<WorkspaceSnapshot>;
  restoreSnapshot: (snapshotId: string) => void;
  deleteSnapshot: (snapshotId: string) => Promise<void>;
  exportSnapshot: (snapshotId: string) => Promise<boolean>;
  importSnapshot: () => Promise<WorkspaceSnapshot | null>;
}

export const createSnapshotsSlice: StateCreator<AppStore, [], [], SnapshotsSlice> = (
  set,
  get,
) => ({
  snapshots: [],
  isSnapshotsLoading: false,
  isSnapshotsModalOpen: false,

  setSnapshotsModalOpen: (open) => set({ isSnapshotsModalOpen: open }),

  loadSnapshots: async () => {
    set({ isSnapshotsLoading: true });
    try {
      const snapshots = await ipc.invoke('snapshots:list', undefined);
      set({ snapshots, isSnapshotsLoading: false });
    } catch {
      set({ isSnapshotsLoading: false });
    }
  },

  saveCurrentWorkspace: async (name, description) => {
    const state = get();
    const activeTab = state.activeTab();
    const payload: Omit<WorkspaceSnapshot, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      tabs: state.tabs,
      activeTabPath: activeTab?.path ?? null,
      shell: state.activeShell,
      themeMode: state.themeMode,
    };
    if (description) {
      payload.description = description;
    }
    const saved = await ipc.invoke('snapshots:save', payload);
    await get().loadSnapshots();
    return saved;
  },

  restoreSnapshot: (snapshotId) => {
    const snapshot = get().snapshots.find((s) => s.id === snapshotId);
    if (!snapshot || snapshot.tabs.length === 0) return;

    const activeTab =
      snapshot.tabs.find((t) => t.path === snapshot.activeTabPath) ?? snapshot.tabs[0];

    set({
      tabs: snapshot.tabs,
      activeTabId: activeTab?.id ?? snapshot.tabs[0]?.id ?? null,
      activeShell: snapshot.shell,
      themeMode: snapshot.themeMode,
      isSnapshotsModalOpen: false,
    });
  },

  deleteSnapshot: async (snapshotId) => {
    await ipc.invoke('snapshots:delete', { id: snapshotId });
    await get().loadSnapshots();
  },

  exportSnapshot: async (snapshotId) => {
    return await ipc.invoke('snapshots:export', { snapshotId });
  },

  importSnapshot: async () => {
    const imported = await ipc.invoke('snapshots:import', undefined);
    if (imported) {
      await get().loadSnapshots();
    }
    return imported;
  },
});
