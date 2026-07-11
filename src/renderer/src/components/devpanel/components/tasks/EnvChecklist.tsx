import { KeyRound } from 'lucide-react';
import type { EnvChecklistItem as EnvChecklistItemType } from '@shared/types/devPanel';
import { EnvChecklistItem } from './EnvChecklistItem';

export function EnvChecklist({ items }: { items: EnvChecklistItemType[] }): React.JSX.Element {
  return (
    <section className="rounded-shell border border-shell-border bg-shell-sidebar/25">
      <div className="flex items-center justify-between border-b border-shell-border px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-current/55">Env Checklist</h3>
        <span className="text-[10px] text-current/40">{items.filter((item) => item.present).length}/{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-4 text-xs text-current/45">
          <KeyRound size={14} />
          Add .env.example to enable this checklist.
        </div>
      ) : (
        <div className="divide-y divide-shell-border/60">
          {items.map((item) => <EnvChecklistItem key={`${item.source}-${item.key}`} item={item} />)}
        </div>
      )}
    </section>
  );
}
