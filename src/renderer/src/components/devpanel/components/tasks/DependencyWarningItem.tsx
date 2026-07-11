import { AlertTriangle, Info } from 'lucide-react';
import type { DependencyWarning } from '@shared/types/devPanel';

export function DependencyWarningItem({ warning }: { warning: DependencyWarning }): React.JSX.Element {
  const Icon = warning.severity === 'warn' ? AlertTriangle : Info;

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Icon size={14} className={warning.severity === 'warn' ? 'text-amber-600' : 'text-shell-accent'} />
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold text-current">{warning.packageName}</div>
        <div className="text-[11px] text-current/45">{warning.message}</div>
      </div>
    </div>
  );
}
