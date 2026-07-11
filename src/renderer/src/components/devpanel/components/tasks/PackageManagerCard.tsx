import { PackageCheck, Play } from 'lucide-react';
import { Button } from '@renderer/components/ui/Button';
import { packageManagerInstallCommand } from '@renderer/lib/devPanelDashboardUtils';
import type { ProjectType } from '@shared/types/devPanel';

export function PackageManagerCard({
  packageManager,
  projectType,
  onRunCommand,
}: {
  packageManager: string | null;
  projectType: ProjectType;
  onRunCommand: (command: string) => Promise<void>;
}): React.JSX.Element {
  const installCommand = packageManagerInstallCommand(packageManager);

  return (
    <section className="rounded-shell border border-shell-border bg-shell-sidebar/25 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-shell bg-shell-accent/10 text-shell-accent">
            <PackageCheck size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-current">Project Tasks</h3>
            <p className="truncate text-xs text-current/45">
              {packageManager === null ? `${projectType} project` : `${packageManager} · ${projectType}`}
            </p>
          </div>
        </div>
        {installCommand !== null ? (
          <Button onClick={() => void onRunCommand(installCommand)} variant="outline" className="gap-2">
            <Play size={13} />
            Install
          </Button>
        ) : null}
      </div>
    </section>
  );
}
