import React, { useState } from 'react';
import { Play, Terminal } from 'lucide-react';
import type { DevScript } from '@shared/types/devPanel';

interface ScriptsPanelProps {
  scripts: DevScript[];
  onRun: (command: string) => Promise<void>;
}

export function ScriptsPanel({ scripts, onRun }: ScriptsPanelProps): React.JSX.Element {
  const [runningCmd, setRunningCmd] = useState<string | null>(null);

  const handleRun = async (command: string): Promise<void> => {
    setRunningCmd(command);
    try {
      await onRun(command);
    } finally {
      // Small delay so the user can see the loading state
      setTimeout(() => setRunningCmd(null), 800);
    }
  };

  if (scripts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-current/40 gap-2">
        <Terminal size={24} />
        <span className="text-xs">No scripts defined</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {scripts.map((script) => {
        const isRunning = runningCmd === script.command;
        return (
          <div
            key={script.name}
            className="group flex items-center justify-between gap-3 rounded-shell px-3 py-2.5 hover:bg-shell-sidebar/60 transition-colors border border-transparent hover:border-shell-border"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-current">{script.name}</span>
              </div>
              <span className="mt-0.5 block truncate font-mono text-[10px] text-current/45">
                {script.command}
              </span>
            </div>
            <button
              type="button"
              disabled={isRunning}
              onClick={() => void handleRun(script.command)}
              className="flex items-center gap-1.5 shrink-0 rounded-shell px-2.5 py-1 text-[10px] font-semibold bg-shell-accent/10 text-shell-accent hover:bg-shell-accent/20 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
              title={`Run: ${script.command}`}
            >
              <Play size={10} className={isRunning ? 'animate-pulse' : ''} />
              {isRunning ? 'Running…' : 'Run'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
