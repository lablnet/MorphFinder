import { Play, Star } from 'lucide-react';
import { cn } from '@lablnet/ui';
import type { ScriptRunState } from '@renderer/hooks/files/useDevPanel';
import type { DevScript } from '@shared/types/devPanel';

export function TaskScriptRow({
  script,
  isFavorite,
  runState,
  onRunScript,
  onToggleFavorite,
}: {
  script: DevScript;
  isFavorite: boolean;
  runState: ScriptRunState | null;
  onRunScript: (command: string) => Promise<void>;
  onToggleFavorite: (scriptName: string) => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-shell-sidebar/50">
      <button
        type="button"
        onClick={() => onToggleFavorite(script.name)}
        className={cn('shrink-0 text-current/35 hover:text-shell-accent', isFavorite && 'text-shell-accent')}
        title={isFavorite ? 'Remove favorite' : 'Favorite script'}
      >
        <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-current">{script.name}</span>
          {runState !== null ? <span className="rounded bg-shell-accent/10 px-1.5 py-0.5 text-[10px] font-semibold capitalize text-shell-accent">{runState.status}</span> : null}
        </div>
        <div className="mt-0.5 truncate font-mono text-[10px] text-current/45">{script.command}</div>
      </div>
      <button
        type="button"
        onClick={() => void onRunScript(script.command)}
        className="flex shrink-0 items-center gap-1.5 rounded-shell bg-shell-accent/10 px-2.5 py-1 text-[10px] font-semibold text-shell-accent transition-colors hover:bg-shell-accent/20"
      >
        <Play size={10} />
        Run
      </button>
    </div>
  );
}
