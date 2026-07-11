import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DirectoryAnnotation, DirectoryAnnotationTag } from '@shared/types/directoryAnnotations';
import { ipc } from '@renderer/services/ipc';

const EMPTY_ANNOTATION: DirectoryAnnotation = {
  path: '',
  tags: [],
  notes: '',
  updatedAt: 0,
};

export function useDirectoryAnnotations(path: string | null) {
  const [annotation, setAnnotation] = useState<DirectoryAnnotation>(EMPTY_ANNOTATION);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (path === null) {
      setAnnotation(EMPTY_ANNOTATION);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    void ipc.invoke('annotations:get', { path })
      .then((next) => {
        if (!cancelled) setAnnotation(next);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  const save = useCallback(async (next: { tags: DirectoryAnnotationTag[]; notes: string }): Promise<void> => {
    if (path === null) return;
    setIsSaving(true);
    setError(null);
    try {
      const saved = await ipc.invoke('annotations:set', { path, tags: next.tags, notes: next.notes });
      setAnnotation(saved);
      const { useAppStore } = await import('@renderer/store');
      useAppStore.getState().updateAnnotation(saved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setIsSaving(false);
    }
  }, [path]);

  return useMemo(() => ({
    annotation,
    isLoading,
    isSaving,
    error,
    save,
  }), [annotation, error, isLoading, isSaving, save]);
}
