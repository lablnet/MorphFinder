import { useState, useEffect, useCallback, useRef } from 'react';
import { readDevPanelFavorites, writeDevPanelFavorites } from '@renderer/lib/devPanelDashboardUtils';
import { ipc } from '@renderer/services/ipc';
import { useAppStore } from '@renderer/store';
import type { DevPanelInfo } from '@shared/types/devPanel';

export type DevPanelTab = 'overview' | 'tasks' | 'scripts' | 'dependencies' | 'env';
export type ScriptRunStatus = 'queued' | 'sent' | 'failed';

export interface ScriptRunState {
  status: ScriptRunStatus;
  ranAt: number;
}

export function useDevPanel(scanPath: string) {
  const queueTerminalCommand = useAppStore((state) => state.queueTerminalCommand);
  const [info, setInfo] = useState<DevPanelInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DevPanelTab>('overview');
  const [selectedSubPath, setSelectedSubPath] = useState<string | null>(null);
  const [revealedEnvKeys, setRevealedEnvKeys] = useState<Set<string>>(new Set());
  const [favoriteScripts, setFavoriteScripts] = useState<Set<string>>(() => readDevPanelFavorites(scanPath));
  const [scriptRunState, setScriptRunState] = useState<Record<string, ScriptRunState>>({});

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
      setSelectedSubPath(null);
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
    setFavoriteScripts(readDevPanelFavorites(scanPath));
  }, [scan, scanPath]);

  const refresh = useCallback((): void => {
    void scan(scanPathRef.current);
  }, [scan]);

  const activeInfo = (info?.subProjects && selectedSubPath
    ? info.subProjects.find((sub) => sub.path === selectedSubPath)
    : null) ?? info;

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
    const cwd = activeInfo?.path || scanPath;
    if (!cwd) return;
    setScriptRunState((current) => ({ ...current, [command]: { status: 'queued', ranAt: Date.now() } }));
    try {
      queueTerminalCommand(cwd, command);
      setScriptRunState((current) => ({ ...current, [command]: { status: 'sent', ranAt: Date.now() } }));
    } catch (cause) {
      setScriptRunState((current) => ({ ...current, [command]: { status: 'failed', ranAt: Date.now() } }));
      throw cause;
    }
  }, [activeInfo?.path, queueTerminalCommand, scanPath]);

  const toggleFavoriteScript = useCallback((scriptName: string): void => {
    setFavoriteScripts((current) => {
      const next = new Set(current);
      if (next.has(scriptName)) next.delete(scriptName);
      else next.add(scriptName);
      writeDevPanelFavorites(scanPath, next);
      return next;
    });
  }, [scanPath]);

  return {
    info,
    activeInfo,
    selectedSubPath,
    setSelectedSubPath,
    loading,
    error,
    activeTab,
    setActiveTab,
    revealedEnvKeys,
    favoriteScripts,
    scriptRunState,
    revealEnvKey,
    runScript,
    toggleFavoriteScript,
    refresh,
    scanPath,
  };
}
