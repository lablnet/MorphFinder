import { useEffect } from 'react';
import { useFolderPicker } from '@renderer/hooks/files/useFolderPicker';
import { BaseDialog } from '../ui/BaseDialog';
import { FolderPickerContent } from './components/FolderPickerContent';
import { FolderPickerFooter } from './components/FolderPickerFooter';
import { FolderPickerHeader } from './components/FolderPickerHeader';
import { FolderPickerPlaces } from './components/FolderPickerPlaces';
import { FolderPickerToolbar } from './components/FolderPickerToolbar';

export function FolderPickerDialog({
  initialPath,
  title = 'Choose Folder',
  onChoose,
  onClose,
}: {
  initialPath?: string | null;
  title?: string;
  onChoose: (path: string) => void;
  onClose: () => void;
}): React.JSX.Element {
  const picker = useFolderPicker(initialPath);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <BaseDialog
      activeShell={picker.activeShell}
      size="lg"
      onClose={onClose}
      className="!w-[min(1040px,92vw)] !max-w-none p-0 overflow-hidden"
    >
      <div className="flex h-[min(760px,88vh)] min-h-[540px] flex-col">
        <FolderPickerHeader title={title} currentPath={picker.currentPath} onClose={onClose} />
        <FolderPickerToolbar
          currentPath={picker.currentPath}
          pathInput={picker.pathInput}
          isLoading={picker.isLoading}
          viewMode={picker.viewMode}
          onLoadPath={(path) => void picker.loadPath(path)}
          onPathInputChange={picker.setPathInput}
          onPathInputFocusChange={picker.setPathInputFocused}
          onViewModeChange={picker.setViewMode}
        />

        <div className="flex min-h-0 flex-1">
          <FolderPickerPlaces quickFolders={picker.quickFolders} onLoadPath={(path) => void picker.loadPath(path)} />
          <FolderPickerContent
            nodes={picker.sortedNodes}
            directoryCount={picker.directoryCount}
            fileCount={picker.fileCount}
            isLoading={picker.isLoading}
            error={picker.error}
            viewMode={picker.viewMode}
            onOpenFolder={(path) => void picker.loadPath(path)}
          />
        </div>

        <FolderPickerFooter
          currentPath={picker.currentPath}
          isLoading={picker.isLoading}
          error={picker.error}
          onChoose={onChoose}
          onClose={onClose}
        />
      </div>
    </BaseDialog>
  );
}
