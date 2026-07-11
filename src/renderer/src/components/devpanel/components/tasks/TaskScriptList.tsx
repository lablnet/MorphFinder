import { Terminal } from 'lucide-react';
import type { ScriptRunState } from '@renderer/hooks/files/useDevPanel';
import type { DevScript } from '@shared/types/devPanel';
import { TaskScriptRow } from './TaskScriptRow';

export function TaskScriptList({
  scripts,
  favoriteScripts,
  scriptRunState,
  onRunScript,
  onToggleFavorite,
}: {
  scripts: DevScript[];
  favoriteScripts: Set<string>;
  scriptRunState: Record<string, ScriptRunState>;
  onRunScript: (command: string) => Promise<void>;
  onToggleFavorite: (scriptName: string) => void;
}): React.JSX.Element {
  if (scripts.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center gap-2 rounded-shell border border-shell-border bg-shell-sidebar/25 py-12 text-current/40">
        <Terminal size={24} />
        <span className="text-xs">No runnable scripts detected</span>
      </section>
    );
  }

  return (
    <section className="rounded-shell border border-shell-border bg-shell-sidebar/25">
      <div className="border-b border-shell-border px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-current/55">Scripts</h3>
      </div>
      <div className="divide-y divide-shell-border/60">
        {scripts.map((script) => (
          <TaskScriptRow
            key={script.name}
            script={script}
            isFavorite={favoriteScripts.has(script.name)}
            runState={scriptRunState[script.command] ?? null}
            onRunScript={onRunScript}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}
