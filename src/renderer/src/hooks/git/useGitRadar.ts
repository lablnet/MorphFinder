import { useState, useEffect, useCallback } from 'react';
import { ipc } from '@renderer/services/ipc';
import type { GitStatus, GitCommit } from '@shared/types/git';

export function useGitRadar(path: string | null) {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [gitHistory, setGitHistory] = useState<GitCommit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!path) return;
    
    // Ignore virtual locations
    if (path.startsWith('morph://')) {
      setGitStatus(null);
      setGitHistory([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const status = await ipc.invoke('git:status', { path });
      setGitStatus(status);

      if (status.isRepo) {
        const history = await ipc.invoke('git:history', { path });
        setGitHistory(history);
      } else {
        setGitHistory([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setGitStatus(null);
      setGitHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [path]);

  // Load status whenever the active path changes
  useEffect(() => {
    void refresh();
  }, [path, refresh]);

  // Listen to file system changes to trigger Git refresh
  useEffect(() => {
    if (!path || path.startsWith('morph://')) return;

    const unsubscribe = ipc.on('fs:changed', (event) => {
      // If a file inside this directory changes, refresh git status
      if (event.path === path) {
        void refresh();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [path, refresh]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return {
    gitStatus,
    gitHistory,
    isLoading,
    error,
    isOpen,
    setIsOpen,
    toggleOpen,
    refresh,
  };
}
