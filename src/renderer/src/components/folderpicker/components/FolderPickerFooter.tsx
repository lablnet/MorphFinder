import { Folder } from 'lucide-react';
import { Button } from '@renderer/components/ui/Button';

export function FolderPickerFooter({
  currentPath,
  isLoading,
  error,
  onChoose,
  onClose,
}: {
  currentPath: string;
  isLoading: boolean;
  error: string | null;
  onChoose: (path: string) => void;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <div className="flex shrink-0 flex-col gap-3 border-t border-shell-border bg-shell-sidebar/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs leading-5 text-current/55">
        Click a folder to browse into it.
        <br className="sm:hidden" />
        <span className="sm:ml-1">Use Choose This Folder to select the folder shown above.</span>
      </p>
      <div className="flex shrink-0 items-center justify-end gap-2">
        <Button onClick={onClose} variant="outline">Cancel</Button>
        <Button onClick={() => onChoose(currentPath)} disabled={isLoading || error !== null} variant="accent" className="gap-2">
          <Folder size={14} />
          Choose This Folder
        </Button>
      </div>
    </div>
  );
}
