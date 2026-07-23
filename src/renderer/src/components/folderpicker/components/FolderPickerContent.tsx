import { Loader2 } from 'lucide-react';
import type { FolderPickerViewMode } from '@renderer/hooks/files/useFolderPicker';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { FolderPickerNodeItem } from './FolderPickerNodeItem';

export function FolderPickerContent({
  nodes,
  directoryCount,
  fileCount,
  isLoading,
  error,
  viewMode,
  onOpenFolder,
}: {
  nodes: FileSystemNode[];
  directoryCount: number;
  fileCount: number;
  isLoading: boolean;
  error: string | null;
  viewMode: FolderPickerViewMode;
  onOpenFolder: (path: string) => void;
}): React.JSX.Element {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-shell-border px-4 text-xs text-current/45">
        <span>{directoryCount} folders, {fileCount} files</span>
        <span className="hidden sm:inline">Folders can be opened. Files are shown for context.</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-current/50">
            <Loader2 size={18} className="animate-spin" />
            Loading folder...
          </div>
        ) : error !== null ? (
          <div className="rounded-shell border border-shell-border bg-shell-sidebar/40 p-3 text-xs text-current/70">{error}</div>
        ) : nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-current/45">This folder is empty. You can choose it.</div>
        ) : viewMode === 'list' ? (
          <div className="space-y-1">
            <div className="grid grid-cols-[minmax(0,1fr)_110px_160px] gap-3 px-3 pb-1 text-[10px] font-semibold uppercase text-current/35">
              <span>Name</span>
              <span>Size / Kind</span>
              <span>Modified</span>
            </div>
            {nodes.map((node) => (
              <FolderPickerNodeItem key={node.path} node={node} viewMode={viewMode} onOpenFolder={onOpenFolder} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-2">
            {nodes.map((node) => (
              <FolderPickerNodeItem key={node.path} node={node} viewMode={viewMode} onOpenFolder={onOpenFolder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
