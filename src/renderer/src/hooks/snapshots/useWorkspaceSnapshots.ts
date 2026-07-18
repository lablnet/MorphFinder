import { useEffect } from 'react';
import { useAppStore } from '@renderer/store';

export function useWorkspaceSnapshots() {
  const snapshots = useAppStore((state) => state.snapshots);
  const isLoading = useAppStore((state) => state.isSnapshotsLoading);
  const isModalOpen = useAppStore((state) => state.isSnapshotsModalOpen);
  const setModalOpen = useAppStore((state) => state.setSnapshotsModalOpen);
  const loadSnapshots = useAppStore((state) => state.loadSnapshots);
  const saveCurrentWorkspace = useAppStore((state) => state.saveCurrentWorkspace);
  const restoreSnapshot = useAppStore((state) => state.restoreSnapshot);
  const deleteSnapshot = useAppStore((state) => state.deleteSnapshot);
  const exportSnapshot = useAppStore((state) => state.exportSnapshot);
  const importSnapshot = useAppStore((state) => state.importSnapshot);

  useEffect(() => {
    void loadSnapshots();
  }, [loadSnapshots]);

  return {
    snapshots,
    isLoading,
    isModalOpen,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
    loadSnapshots,
    saveCurrentWorkspace,
    restoreSnapshot,
    deleteSnapshot,
    exportSnapshot,
    importSnapshot,
  };
}
