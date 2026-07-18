import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from '@lablnet/ui';
import { Camera, Plus, Upload } from 'lucide-react';
import { useWorkspaceSnapshots } from '../../hooks/snapshots/useWorkspaceSnapshots';
import { SnapshotCard } from './SnapshotCard';
import { SaveSnapshotForm } from './SaveSnapshotForm';
import { SnapshotEmptyState } from './SnapshotEmptyState';

export function WorkspaceSnapshotsModal() {
  const {
    snapshots,
    isLoading,
    isModalOpen,
    closeModal,
    saveCurrentWorkspace,
    restoreSnapshot,
    deleteSnapshot,
    exportSnapshot,
    importSnapshot,
  } = useWorkspaceSnapshots();

  const [isSavingFormOpen, setIsSavingFormOpen] = useState(false);

  const handleSave = async (name: string, description?: string) => {
    await saveCurrentWorkspace(name, description);
    setIsSavingFormOpen(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                <Camera className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Workspace Snapshots</DialogTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Save, restore, and share your exact workspace session state.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => void importSnapshot()}
              >
                <Upload className="size-3.5" />
                Import `.morphws`
              </Button>
              {!isSavingFormOpen && (
                <Button
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => setIsSavingFormOpen(true)}
                >
                  <Plus className="size-3.5" />
                  Save Current
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {isSavingFormOpen && (
            <SaveSnapshotForm
              defaultName={`Workspace ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
              onCancel={() => setIsSavingFormOpen(false)}
              onSave={handleSave}
            />
          )}

          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading snapshots...</div>
          ) : snapshots.length === 0 && !isSavingFormOpen ? (
            <SnapshotEmptyState onSaveCurrent={() => setIsSavingFormOpen(true)} />
          ) : (
            <ScrollArea className="max-h-[60vh] pr-2">
              <div className="grid gap-3 sm:grid-cols-2">
                {snapshots.map((snapshot) => (
                  <SnapshotCard
                    key={snapshot.id}
                    snapshot={snapshot}
                    onDelete={(id) => void deleteSnapshot(id)}
                    onExport={(id) => void exportSnapshot(id)}
                    onRestore={(id) => restoreSnapshot(id)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
