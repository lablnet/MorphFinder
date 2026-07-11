import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { ProjectHealthCheck } from '@shared/types/devPanel';

export function ProjectHealthItem({ check }: { check: ProjectHealthCheck }): React.JSX.Element {
  const Icon = check.status === 'pass' ? CheckCircle2 : check.status === 'fail' ? XCircle : AlertTriangle;
  const color = check.status === 'pass' ? 'text-green-600' : check.status === 'fail' ? 'text-red-600' : 'text-amber-600';

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Icon size={15} className={color} />
      <div className="min-w-0">
        <div className="text-xs font-semibold text-current">{check.label}</div>
        <div className="mt-0.5 text-[11px] text-current/45">{check.detail}</div>
      </div>
    </div>
  );
}
