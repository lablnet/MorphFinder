import React from 'react';
import { FileText, Save, Tags, X, Calendar, Hash, HardDrive, Copy, Check } from 'lucide-react';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { Button } from '@renderer/components/ui/Button';
import { useDetailsPanel } from '@renderer/hooks';
import { TagEditor } from '../directoryannotator/components/TagEditor';
import { NotesEditor } from '../directoryannotator/components/NotesEditor';
import { formatBytes } from '@renderer/lib/format';
import { FileIcon } from '../fileicons/FileIcon';

interface DetailsPanelProps {
  node: FileSystemNode | null;
  onClose: () => void;
}

export function DetailsPanel({ node, onClose }: DetailsPanelProps): React.JSX.Element | null {
  const {
    tags,
    setTags,
    notes,
    setNotes,
    copied,
    handleCopyPath,
    hasChanges,
    isSaving,
    isLoading,
    error,
    save,
    updatedText,
  } = useDetailsPanel(node);

  if (node === null) return null;

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-shell-border bg-shell-surface shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-shell-border px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-current">{node.name}</div>
          <div className="mt-0.5 text-xs capitalize text-current/50">{node.kind} Details</div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} title="Close details panel" className="shrink-0 hover:bg-black/5 dark:hover:bg-white/5">
          <X size={16} />
        </Button>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 space-y-6 overflow-auto p-4 custom-scrollbar">
        {error !== null ? (
          <div className="rounded-shell border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-600 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {/* Icon & Path Section */}
        <div className="flex flex-col items-center justify-center border-b border-shell-border/40 pb-4 text-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-shell-sidebar shadow-md">
            <FileIcon node={node} size={36} className={node.kind === 'directory' ? 'text-[color:var(--shell-accent)]' : 'text-current/75'} />
          </div>
          <div className="w-full text-xs text-current/80 font-medium break-all select-all px-2 bg-shell-sidebar py-1.5 rounded border border-shell-border flex items-center justify-between gap-2 mt-2">
            <span className="truncate max-w-[190px]">{node.path}</span>
            <Button size="icon" variant="ghost" onClick={handleCopyPath} title="Copy Path" className="h-6 w-6 shrink-0 text-current/50 hover:text-current hover:bg-black/5">
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            </Button>
          </div>
        </div>

        {/* Metadata Details Section */}
        <section className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-current/55">Properties</div>
          <div className="rounded-xl border border-shell-border/60 bg-shell-sidebar/40 p-3 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-current/50 flex items-center gap-1.5"><Hash size={13} /> Size</span>
              <span className="font-medium text-current">{node.kind === 'directory' ? '--' : formatBytes(node.sizeInBytes)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-current/50 flex items-center gap-1.5"><HardDrive size={13} /> Kind</span>
              <span className="font-medium text-current capitalize">{node.kind}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-current/50 flex items-center gap-1.5"><Calendar size={13} /> Created</span>
              <span className="font-medium text-current/80">{new Date(node.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-current/50 flex items-center gap-1.5"><Calendar size={13} /> Modified</span>
              <span className="font-medium text-current/80">{new Date(node.modifiedAt).toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Tag Editor Section */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-current/55">
            <Tags size={14} />
            <span>Tags</span>
          </div>
          <div className="rounded-xl border border-shell-border/60 bg-shell-sidebar/40 p-3">
            <TagEditor tags={tags} onChange={setTags} />
          </div>
        </section>

        {/* Notes Editor Section */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-current/55">
            <FileText size={14} />
            <span>Notes</span>
          </div>
          <div className="rounded-xl border border-shell-border/60 bg-shell-sidebar/40 p-3">
            <NotesEditor value={notes} onChange={setNotes} />
          </div>
        </section>
      </div>

      {/* Footer / Save Button */}
      <div className="flex items-center justify-between gap-3 border-t border-shell-border px-4 py-3">
        <span className="min-w-0 truncate text-[10px] text-current/45">{isLoading ? 'Loading...' : `Saved: ${updatedText}`}</span>
        <Button
          variant="accent"
          size="sm"
          disabled={!hasChanges || isSaving}
          onClick={save}
          className="gap-1.5 shadow-sm"
        >
          <Save size={14} />
          {isSaving ? 'Saving' : 'Save'}
        </Button>
      </div>
    </aside>
  );
}

export default DetailsPanel;
