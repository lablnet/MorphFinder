import type { ProjectHealthCheck } from '@shared/types/devPanel';
import { ProjectHealthItem } from './ProjectHealthItem';

export function ProjectHealthGrid({ checks }: { checks: ProjectHealthCheck[] }): React.JSX.Element {
  return (
    <section className="rounded-shell border border-shell-border bg-shell-sidebar/25">
      <div className="border-b border-shell-border px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-current/55">Health Checks</h3>
      </div>
      <div className="divide-y divide-shell-border/60">
        {checks.map((check) => <ProjectHealthItem key={check.id} check={check} />)}
      </div>
    </section>
  );
}
