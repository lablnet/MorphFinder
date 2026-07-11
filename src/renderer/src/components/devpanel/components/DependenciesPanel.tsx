import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { cn } from '@lablnet/ui';
import type { DevDependency } from '@shared/types/devPanel';

interface DependenciesPanelProps {
  dependencies: DevDependency[];
}

type Filter = 'all' | 'prod' | 'dev';

export function DependenciesPanel({ dependencies }: DependenciesPanelProps): React.JSX.Element {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const prod = dependencies.filter((d) => !d.isDev);
  const dev = dependencies.filter((d) => d.isDev);

  const visible = dependencies
    .filter((d) => {
      if (filter === 'prod') return !d.isDev;
      if (filter === 'dev') return d.isDev;
      return true;
    })
    .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  if (dependencies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-current/40 gap-2">
        <Package size={24} />
        <span className="text-xs">No dependencies found</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter pills + counts */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'prod', 'dev'] as Filter[]).map((f) => {
          const count = f === 'all' ? dependencies.length : f === 'prod' ? prod.length : dev.length;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium border transition-colors',
                filter === f
                  ? 'bg-shell-accent/15 border-shell-accent/30 text-shell-accent'
                  : 'border-shell-border text-current/50 hover:text-current hover:border-shell-border/80'
              )}
            >
              {f === 'all' ? 'All' : f === 'prod' ? 'Production' : 'Dev'}
              <span className="ml-0.5 opacity-70">{count}</span>
            </button>
          );
        })}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter packages..."
          className="ml-auto flex-shrink min-w-0 w-36 rounded-shell bg-shell-sidebar border border-shell-border px-2 py-0.5 text-[11px] text-current placeholder-current/35 outline-none focus:border-shell-accent/50"
        />
      </div>

      {/* Table */}
      <div className="rounded-shell border border-shell-border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-shell-sidebar/60">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-current/50 uppercase tracking-wide text-[10px]">Package</th>
              <th className="px-3 py-2 text-left font-medium text-current/50 uppercase tracking-wide text-[10px]">Version</th>
              <th className="px-3 py-2 text-left font-medium text-current/50 uppercase tracking-wide text-[10px]">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-shell-border/50">
            {visible.map((dep) => (
              <tr key={`${dep.name}-${dep.isDev ? 'dev' : 'prod'}`} className="hover:bg-shell-sidebar/40 transition-colors">
                <td className="px-3 py-2 font-medium text-current">{dep.name}</td>
                <td className="px-3 py-2 font-mono text-current/60">{dep.version}</td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      'inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide',
                      dep.isDev
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                        : 'bg-green-500/10 text-green-700 dark:text-green-400'
                    )}
                  >
                    {dep.isDev ? 'dev' : 'prod'}
                  </span>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-current/40 text-xs">
                  No packages match
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
