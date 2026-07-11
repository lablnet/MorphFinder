import React, { useState, useCallback } from 'react';
import { Code2, FolderOpen } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { useDevPanel } from '../../hooks/files/useDevPanel';
import { useAppStore } from '@renderer/store';
import { ipc } from '@renderer/services/ipc';

// Sub-components
import { DevPanelHeader } from './components/DevPanelHeader';
import { TabBar } from './components/TabBar';
import { ProjectMetaCard } from './components/ProjectMetaCard';
import { ScriptsPanel } from './components/ScriptsPanel';
import { DependenciesPanel } from './components/DependenciesPanel';
import { EnvVarsPanel } from './components/EnvVarsPanel';
import { NoProjectFound } from './components/NoProjectFound';

/** Resolves the directory path to scan.
 *  Strategy: use the last real (non-virtual) path from the active tab's back history.
 *  Falls back to home directory if no real path is available. */
function useScanPath(): { scanPath: string; setScanPath: (p: string) => void } {
  const activeTab = useAppStore((state) => state.activeTab());
  const wellKnownDirs = useAppStore((state) => state.wellKnownDirs);

  // Find the most recent non-virtual path from back history
  const VIRTUAL_PREFIX = 'morph://';
  const lastRealPath =
    activeTab?.history.back
      .slice()
      .reverse()
      .find((p) => !p.startsWith(VIRTUAL_PREFIX)) ?? null;

  const defaultPath = lastRealPath ?? wellKnownDirs?.home ?? '/';
  const [overridePath, setOverridePath] = useState<string | null>(null);

  return {
    scanPath: overridePath ?? defaultPath,
    setScanPath: setOverridePath,
  };
}

export function DevPanel(): React.JSX.Element {
  const { scanPath, setScanPath } = useScanPath();
  const {
    info,
    loading,
    error,
    activeTab,
    setActiveTab,
    revealedEnvKeys,
    revealEnvKey,
    runScript,
    refresh,
  } = useDevPanel(scanPath);

  const [isPickingFolder, setIsPickingFolder] = useState(false);

  const handlePickFolder = useCallback(async (): Promise<void> => {
    setIsPickingFolder(true);
    try {
      const selected = await ipc.invoke('shell:selectFolder', { defaultPath: scanPath });
      if (selected !== null) setScanPath(selected);
    } finally {
      setIsPickingFolder(false);
    }
  }, [scanPath, setScanPath]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-shell-surface text-sm relative">

      {/* Page Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-shell-border px-4 py-3 bg-shell-surface/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-shell bg-shell-accent/10 text-shell-accent">
            <Code2 size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-current leading-none">Dev Panel</h2>
            <p className="text-[10px] text-current/45 mt-0.5 font-mono truncate max-w-[320px]">
              {scanPath}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handlePickFolder()}
          disabled={isPickingFolder || loading}
          className={cn(
            'flex items-center gap-1.5 rounded-shell px-2.5 py-1.5 text-xs border border-shell-border',
            'text-current/60 hover:text-current hover:bg-shell-sidebar transition-colors',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
          title="Choose a different project folder"
        >
          <FolderOpen size={13} />
          {isPickingFolder ? 'Selecting…' : 'Change folder'}
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-current/40">
          <div className="h-8 w-8 rounded-full border-2 border-shell-accent/30 border-t-shell-accent animate-spin" />
          <p className="text-xs">Scanning project…</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error !== null && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="text-sm font-semibold text-current/70">Scan failed</p>
          <p className="text-xs text-current/45">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-2 rounded-shell px-3 py-1.5 text-xs border border-shell-border hover:bg-shell-sidebar transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && error === null && info !== null && (
        <>
          {!info.hasProject ? (
            <NoProjectFound path={scanPath} />
          ) : (
            <>
              {/* Project header strip */}
              <DevPanelHeader info={info} onRefresh={refresh} loading={loading} />

              {/* Tab navigation */}
              <TabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                hasScripts={info.scripts.length > 0}
                hasDeps={info.dependencies.length > 0}
                hasEnv={info.envVars.length > 0}
              />

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <ProjectMetaCard info={info} />
                    {/* Quick stats bar */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Scripts', value: info.scripts.length, onClick: () => setActiveTab('scripts') },
                        { label: 'Dependencies', value: info.dependencies.length, onClick: () => setActiveTab('dependencies') },
                        { label: 'Env Vars', value: info.envVars.length, onClick: () => setActiveTab('env') },
                      ].map(({ label, value, onClick }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={onClick}
                          className="flex flex-col items-center gap-1 rounded-shell border border-shell-border p-3 bg-shell-sidebar/30 hover:bg-shell-sidebar/70 hover:border-shell-accent/30 transition-all text-center group"
                        >
                          <span className="text-xl font-bold text-shell-accent">{value}</span>
                          <span className="text-[10px] text-current/50 uppercase tracking-wide group-hover:text-current/70 transition-colors">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'scripts' && (
                  <ScriptsPanel scripts={info.scripts} onRun={runScript} />
                )}

                {activeTab === 'dependencies' && (
                  <DependenciesPanel dependencies={info.dependencies} />
                )}

                {activeTab === 'env' && (
                  <EnvVarsPanel
                    envVars={info.envVars}
                    revealedKeys={revealedEnvKeys}
                    onReveal={revealEnvKey}
                  />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
