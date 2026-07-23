import { X } from 'lucide-react';
import { Button } from '@renderer/components/ui/Button';

export function FolderPickerHeader({
  title,
  currentPath,
  onClose,
}: {
  title: string;
  currentPath: string;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-shell-border px-4 py-3">
      <div className="min-w-0">
        <h2 className="text-sm font-bold text-current">{title}</h2>
        <p className="truncate text-xs text-current/50">{currentPath}</p>
      </div>
      <Button onClick={onClose} size="icon" variant="ghost" title="Close">
        <X size={15} />
      </Button>
    </div>
  );
}
