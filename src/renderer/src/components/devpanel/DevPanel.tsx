import { useState } from 'react';
import { Code2, FolderOpen } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { useDevPanel } from '../../hooks/files/useDevPanel';
import { useDevPanelScanPath } from '@renderer/hooks/files/useDevPanelScanPath';
import { FolderPickerDialog } from '@renderer/components/folderpicker/FolderPickerDialog';

// Sub-components
import { DevPanelHeader } from './components/DevPanelHeader';
import { TabBar } from './components/TabBar';
import { ProjectMetaCard } from './components/ProjectMetaCard';
import { ScriptsPanel } from './components/ScriptsPanel';
import { DependenciesPanel } from './components/DependenciesPanel';
import { EnvVarsPanel } from './components/EnvVarsPanel';
import { NoProjectFound } from './components/NoProjectFound';
import { TaskDashboard } from './components/tasks/TaskDashboard';

export function DevPanel(): React.JSX.Element {
  const { scanPath, isPickingFolder, pickFolder } = useDevPanelScanPath();
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const {
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
  } = useDevPanel(scanPath);

  const displayInfo = activeInfo ?? info;

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
              {displayInfo?.path || scanPath}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsFolderPickerOpen(true)}
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
      {!loading && error === null && info !== null && displayInfo !== null && (
        <>
          {!info.hasProject && (!info.subProjects || info.subProjects.length === 0) ? (
            <NoProjectFound path={scanPath} />
          ) : (
            <>
              {/* Project header strip with monorepo subprojects switcher */}
              <DevPanelHeader
                info={displayInfo}
                subProjects={info.subProjects}
                selectedSubPath={selectedSubPath}
                onSelectSubPath={setSelectedSubPath}
                onRefresh={refresh}
                loading={loading}
              />

              {/* Tab navigation */}
              <TabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                hasScripts={displayInfo.scripts.length > 0}
                hasDeps={displayInfo.dependencies.length > 0}
                hasEnv={displayInfo.envVars.length > 0}
              />

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <ProjectMetaCard info={displayInfo} />
                    {/* Quick stats bar */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Scripts', value: displayInfo.scripts.length, onClick: () => setActiveTab('scripts') },
                        { label: 'Dependencies', value: displayInfo.dependencies.length, onClick: () => setActiveTab('dependencies') },
                        { label: 'Env Vars', value: displayInfo.envVars.length, onClick: () => setActiveTab('env') },
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
                  <ScriptsPanel scripts={displayInfo.scripts} onRun={runScript} />
                )}

                {activeTab === 'tasks' && (
                  <TaskDashboard
                    info={displayInfo}
                    favoriteScripts={favoriteScripts}
                    scriptRunState={scriptRunState}
                    onRunScript={runScript}
                    onToggleFavorite={toggleFavoriteScript}
                  />
                )}

                {activeTab === 'dependencies' && (
                  <DependenciesPanel dependencies={displayInfo.dependencies} />
                )}

                {activeTab === 'env' && (
                  <EnvVarsPanel
                    envVars={displayInfo.envVars}
                    revealedKeys={revealedEnvKeys}
                    onReveal={revealEnvKey}
                  />
                )}
              </div>
            </>
          )}
        </>
      )}
      {isFolderPickerOpen ? (
        <FolderPickerDialog
          title="Choose Project Folder"
          initialPath={scanPath}
          onClose={() => setIsFolderPickerOpen(false)}
          onChoose={(path) => {
            setIsFolderPickerOpen(false);
            void pickFolder(path);
          }}
        />
      ) : null}
    </div>
  );
}
