import { ShieldAlert } from 'lucide-react';
import type { DependencyWarning } from '@shared/types/devPanel';
import { DependencyWarningItem } from './DependencyWarningItem';

export function DependencyWarningList({ warnings }: { warnings: DependencyWarning[] }): React.JSX.Element {
  return (
    <section className="rounded-shell border border-shell-border bg-shell-sidebar/25">
      <div className="flex items-center justify-between border-b border-shell-border px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-current/55">Dependency Warnings</h3>
        <span className="text-[10px] text-current/40">{warnings.length}</span>
      </div>
      {warnings.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-4 text-xs text-current/45">
          <ShieldAlert size={14} />
          No dependency warnings.
        </div>
      ) : (
        <div className="divide-y divide-shell-border/60">
          {warnings.map((warning) => <DependencyWarningItem key={`${warning.packageName}-${warning.message}`} warning={warning} />)}
        </div>
      )}
    </section>
  );
}
