import { useEffect, useMemo, useState } from 'react';
import { FileText, Save, Tags, X } from 'lucide-react';
import type { FileSystemNode } from '@shared/types/fileSystem';
import type { DirectoryAnnotationTag } from '@shared/types/directoryAnnotations';
import { Button } from '@renderer/components/ui/Button';
import { useDirectoryAnnotations } from '@renderer/hooks';
import { TagEditor } from './components/TagEditor';
import { NotesEditor } from './components/NotesEditor';
import { AnnotationPreview } from './components/AnnotationPreview';

interface DirectoryAnnotatorProps {
  node: FileSystemNode | null;
  onClose: () => void;
}

export function DirectoryAnnotator({ node, onClose }: DirectoryAnnotatorProps): React.JSX.Element | null {
  const annotationState = useDirectoryAnnotations(node?.path ?? null);
  const [tags, setTags] = useState<DirectoryAnnotationTag[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setTags(annotationState.annotation.tags);
    setNotes(annotationState.annotation.notes);
  }, [annotationState.annotation]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(tags) !== JSON.stringify(annotationState.annotation.tags) || notes !== annotationState.annotation.notes;
  }, [annotationState.annotation.notes, annotationState.annotation.tags, notes, tags]);

  if (node === null) return null;

  const updatedText = annotationState.annotation.updatedAt > 0
    ? new Date(annotationState.annotation.updatedAt).toLocaleString()
    : 'Not saved yet';

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-shell-border bg-shell-surface">
      <div className="flex items-start justify-between gap-3 border-b border-shell-border px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-current">{node.name}</div>
          <div className="mt-0.5 text-xs capitalize text-current/50">{node.kind} annotations</div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} title="Close notes and tags" className="shrink-0">
          <X size={16} />
        </Button>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-auto p-4 custom-scrollbar">
        {annotationState.error !== null ? (
          <div className="rounded-shell border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-600 dark:text-red-300">
            {annotationState.error}
          </div>
        ) : null}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-current/55">
            <Tags size={14} />
            <span>Tags</span>
          </div>
          <TagEditor tags={tags} onChange={setTags} />
        </section>
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-current/55">
            <FileText size={14} />
            <span>Notes</span>
          </div>
          <NotesEditor value={notes} onChange={setNotes} />
        </section>
        <section className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-current/55">Preview</div>
          <AnnotationPreview notes={notes} />
        </section>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-shell-border px-4 py-3">
        <span className="min-w-0 truncate text-xs text-current/45">{annotationState.isLoading ? 'Loading...' : updatedText}</span>
        <Button
          variant="accent"
          size="sm"
          disabled={!hasChanges || annotationState.isSaving}
          onClick={() => void annotationState.save({ tags, notes })}
          className="gap-1.5"
        >
          <Save size={14} />
          {annotationState.isSaving ? 'Saving' : 'Save'}
        </Button>
      </div>
    </aside>
  );
}
