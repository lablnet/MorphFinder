import { favoriteFirstScripts } from '@renderer/lib/devPanelDashboardUtils';
import type { ScriptRunState } from '@renderer/hooks/files/useDevPanel';
import type { DevPanelInfo } from '@shared/types/devPanel';
import { DependencyWarningList } from './DependencyWarningList';
import { EnvChecklist } from './EnvChecklist';
import { PackageManagerCard } from './PackageManagerCard';
import { ProjectHealthGrid } from './ProjectHealthGrid';
import { TaskScriptList } from './TaskScriptList';

export function TaskDashboard({
  info,
  favoriteScripts,
  scriptRunState,
  onRunScript,
  onToggleFavorite,
}: {
  info: DevPanelInfo;
  favoriteScripts: Set<string>;
  scriptRunState: Record<string, ScriptRunState>;
  onRunScript: (command: string) => Promise<void>;
  onToggleFavorite: (scriptName: string) => void;
}): React.JSX.Element {
  const scripts = favoriteFirstScripts(info.scripts, favoriteScripts);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
      <div className="space-y-4">
        <PackageManagerCard packageManager={info.packageManager} projectType={info.projectType} onRunCommand={onRunScript} />
        <TaskScriptList scripts={scripts} favoriteScripts={favoriteScripts} scriptRunState={scriptRunState} onRunScript={onRunScript} onToggleFavorite={onToggleFavorite} />
      </div>
      <div className="space-y-4">
        <ProjectHealthGrid checks={info.healthChecks} />
        <DependencyWarningList warnings={info.dependencyWarnings} />
        <EnvChecklist items={info.envChecklist} />
      </div>
    </div>
  );
}
