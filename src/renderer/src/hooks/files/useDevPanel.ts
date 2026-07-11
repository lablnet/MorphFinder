import { useState, useEffect, useCallback, useRef } from 'react';
import { ipc } from '@renderer/services/ipc';
import type { DevPanelInfo } from '@shared/types/devPanel';

export type DevPanelTab = 'overview' | 'scripts' | 'dependencies' | 'env';

export function useDevPanel(scanPath: string) {
  const [info, setInfo] = useState<DevPanelInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DevPanelTab>('overview');
  const [revealedEnvKeys, setRevealedEnvKeys] = useState<Set<string>>(new Set());

  // Track scan path with a ref to avoid stale-closure issues in the effect
  const scanPathRef = useRef(scanPath);
  scanPathRef.current = scanPath;

  const scan = useCallback(async (path: string): Promise<void> => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const result = await ipc.invoke('devpanel:scan', { path });
      setInfo(result);
      // Reset revealed vars on every new scan for privacy
      setRevealedEnvKeys(new Set());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-scan whenever the path changes
  useEffect(() => {
    void scan(scanPath);
  }, [scan, scanPath]);

  const refresh = useCallback((): void => {
    void scan(scanPathRef.current);
  }, [scan]);

  const revealEnvKey = useCallback((key: string): void => {
    setRevealedEnvKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const runScript = useCallback(async (command: string): Promise<void> => {
    if (!scanPath) return;
    await ipc.invoke('devpanel:runScript', { cwd: scanPath, command });
  }, [scanPath]);

  return {
    info,
    loading,
    error,
    activeTab,
    setActiveTab,
    revealedEnvKeys,
    revealEnvKey,
    runScript,
    refresh,
    scanPath,
  };
}
