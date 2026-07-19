import { Folder } from 'lucide-react';
import type { FolderPickerQuickFolder } from '@renderer/hooks/files/useFolderPicker';

export function FolderPickerPlaces({
  quickFolders,
  onLoadPath,
}: {
  quickFolders: FolderPickerQuickFolder[];
  onLoadPath: (path: string) => void;
}): React.JSX.Element | null {
  if (quickFolders.length === 0) return null;

  return (
    <aside className="hidden w-48 shrink-0 border-r border-shell-border bg-shell-sidebar/25 p-3 sm:block">
      <div className="mb-2 px-2 text-[10px] font-semibold uppercase text-current/35">Places</div>
      <div className="space-y-1">
        {quickFolders.map((folder) => (
          <button
            key={folder.path}
            type="button"
            onClick={() => onLoadPath(folder.path)}
            className="flex w-full items-center gap-2 rounded-shell px-2 py-1.5 text-left text-xs text-current/65 hover:bg-shell-sidebar hover:text-current"
          >
            <Folder size={14} className="text-shell-accent" />
            <span className="truncate">{folder.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
