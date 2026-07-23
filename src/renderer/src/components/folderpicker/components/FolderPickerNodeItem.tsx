import { File, Folder } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { formatBytes, formatModifiedDate } from '@renderer/lib/format';
import type { FolderPickerViewMode } from '@renderer/hooks/files/useFolderPicker';
import type { FileSystemNode } from '@shared/types/fileSystem';

export function FolderPickerNodeItem({
  node,
  viewMode,
  onOpenFolder,
}: {
  node: FileSystemNode;
  viewMode: FolderPickerViewMode;
  onOpenFolder: (path: string) => void;
}): React.JSX.Element {
  const isDirectory = node.kind === 'directory';

  if (viewMode === 'list') {
    return (
      <button
        type="button"
        onClick={() => {
          if (isDirectory) onOpenFolder(node.path);
        }}
        disabled={!isDirectory}
        className={cn(
          'grid h-9 min-w-0 grid-cols-[minmax(0,1fr)_110px_160px] items-center gap-3 rounded-shell px-3 text-left text-xs',
          isDirectory
            ? 'text-current/80 hover:bg-shell-sidebar hover:text-current focus:bg-shell-sidebar focus:outline-none'
            : 'cursor-default text-current/35',
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {isDirectory ? <Folder size={15} className="shrink-0 text-shell-accent" /> : <File size={15} className="shrink-0" />}
          <span className="truncate">{node.name}</span>
        </span>
        <span className="truncate text-current/45">{isDirectory ? 'Folder' : formatBytes(node.sizeInBytes)}</span>
        <span className="truncate text-current/45">{formatModifiedDate(node.modifiedAt)}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (isDirectory) onOpenFolder(node.path);
      }}
      disabled={!isDirectory}
      className={cn(
        'flex h-28 min-w-0 flex-col items-center justify-center gap-2 rounded-shell px-3 py-2 text-center text-sm',
        isDirectory
          ? 'text-current/80 hover:bg-shell-sidebar hover:text-current focus:bg-shell-sidebar focus:outline-none'
          : 'cursor-default text-current/35',
      )}
    >
      {isDirectory ? <Folder size={38} className="text-shell-accent" /> : <File size={34} />}
      <span className="line-clamp-2 max-w-full break-words leading-tight">{node.name}</span>
    </button>
  );
}
