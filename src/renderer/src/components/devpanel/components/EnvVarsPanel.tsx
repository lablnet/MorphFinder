import React from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import type { EnvVar } from '@shared/types/devPanel';
import { isSensitiveEnvKey } from '@renderer/lib/envUtils';

interface EnvVarsPanelProps {
  envVars: EnvVar[];
  revealedKeys: Set<string>;
  onReveal: (key: string) => void;
}

export function EnvVarsPanel({ envVars, revealedKeys, onReveal }: EnvVarsPanelProps): React.JSX.Element {
  if (envVars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-current/40 gap-2">
        <ShieldAlert size={24} />
        <span className="text-xs">No .env file found</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Warning banner */}
      <div className="flex items-start gap-2 rounded-shell bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 mb-3">
        <ShieldAlert size={13} className="shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5" />
        <p className="text-[10px] text-yellow-700 dark:text-yellow-400 leading-relaxed">
          Values are hidden by default. Click the eye icon to reveal a value. Sensitive keys (tokens, passwords, secrets) are indicated with a shield.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-shell border border-shell-border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-shell-sidebar/60">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-current/50 uppercase tracking-wide text-[10px]">Key</th>
              <th className="px-3 py-2 text-left font-medium text-current/50 uppercase tracking-wide text-[10px]">Value</th>
              <th className="px-3 py-2 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-shell-border/50">
            {envVars.map((envVar) => {
              const sensitive = isSensitiveEnvKey(envVar.key);
              const revealed = revealedKeys.has(envVar.key);
              const displayValue = revealed ? (envVar.value || '(empty)') : '••••••••';
              return (
                <tr key={envVar.key} className="group hover:bg-shell-sidebar/40 transition-colors">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      {sensitive && (
                        <span title="Sensitive variable">
                          <ShieldAlert size={11} className="text-yellow-500 shrink-0" />
                        </span>
                      )}
                      <span className="font-mono font-medium text-current">{envVar.key}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-current/60 max-w-xs truncate">
                    <span className={revealed ? '' : 'select-none tracking-widest text-current/30'}>
                      {displayValue}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onReveal(envVar.key)}
                      className="flex items-center justify-center h-5 w-5 rounded text-current/35 hover:text-current hover:bg-shell-sidebar transition-colors opacity-0 group-hover:opacity-100"
                      title={revealed ? 'Hide value' : 'Reveal value'}
                    >
                      {revealed ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
