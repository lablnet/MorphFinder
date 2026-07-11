import { CheckCircle2, Circle } from 'lucide-react';
import type { EnvChecklistItem as EnvChecklistItemType } from '@shared/types/devPanel';

export function EnvChecklistItem({ item }: { item: EnvChecklistItemType }): React.JSX.Element {
  const Icon = item.present ? CheckCircle2 : Circle;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Icon size={14} className={item.present ? 'text-green-600' : 'text-current/30'} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-xs text-current">{item.key}</div>
        <div className="text-[10px] text-current/40">{item.source}</div>
      </div>
    </div>
  );
}
