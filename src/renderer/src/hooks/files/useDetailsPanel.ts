import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FileSystemNode } from '@shared/types/fileSystem';
import type { DirectoryAnnotationTag } from '@shared/types/directoryAnnotations';
import { useDirectoryAnnotations } from './useDirectoryAnnotations';

export function useDetailsPanel(node: FileSystemNode | null) {
  const annotationState = useDirectoryAnnotations(node?.path ?? null);
  const [tags, setTags] = useState<DirectoryAnnotationTag[]>([]);
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTags(annotationState.annotation.tags);
    setNotes(annotationState.annotation.notes);
  }, [annotationState.annotation]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(tags) !== JSON.stringify(annotationState.annotation.tags) || notes !== annotationState.annotation.notes;
  }, [annotationState.annotation.notes, annotationState.annotation.tags, notes, tags]);

  const handleCopyPath = useCallback(async () => {
    if (!node) return;
    try {
      await navigator.clipboard.writeText(node.path);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy path:', err);
    }
  }, [node]);

  const save = useCallback(() => {
    void annotationState.save({ tags, notes });
  }, [annotationState.save, tags, notes]);

  const updatedText = annotationState.annotation.updatedAt > 0
    ? new Date(annotationState.annotation.updatedAt).toLocaleString()
    : 'Not saved yet';

  return {
    tags,
    setTags,
    notes,
    setNotes,
    copied,
    handleCopyPath,
    hasChanges,
    isSaving: annotationState.isSaving,
    isLoading: annotationState.isLoading,
    error: annotationState.error,
    save,
    updatedText,
  };
}
