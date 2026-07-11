import React from 'react';
import {
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Terminal,
  Cpu,
  FolderOpen,
  Server,
  CheckCircle
} from 'lucide-react';
import type { CacheTarget } from '@shared/types/cache';
import { formatBytes } from '../../../hooks/files/useCacheCleaner';

interface CacheTableProps {
  scanning: boolean;
  sortedTargets: CacheTarget[];
  selectedIds: Set<string>;
  errors: Record<string, string>;
  sortBy: 'name' | 'category' | 'size';
  sortOrder: 'asc' | 'desc';
  handleToggleSelect: (id: string) => void;
  handleToggleSelectAll: () => void;
  toggleSort: (field: 'name' | 'category' | 'size') => void;
}

export function CacheTable({
  scanning,
  sortedTargets,
  selectedIds,
  errors,
  sortBy,
  sortOrder,
  handleToggleSelect,
  handleToggleSelectAll,
  toggleSort,
}: CacheTableProps): React.JSX.Element {
  // Determine category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Developer':
        return <Terminal size={15} className="text-blue-500 dark:text-blue-400" />;
      case 'AI':
        return <Cpu size={15} className="text-purple-500 dark:text-purple-400" />;
      case 'Application':
        return <FolderOpen size={15} className="text-yellow-500 dark:text-yellow-400" />;
      default:
        return <Server size={15} className="text-green-500 dark:text-green-400" />;
    }
  };

  if (scanning && sortedTargets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-current/50 gap-2">
        <div className="animate-spin h-6 w-6 border-2 border-shell-accent border-t-transparent rounded-full" />
        <p className="text-xs font-medium">Scanning folders & calculating sizes...</p>
      </div>
    );
  }

  if (sortedTargets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-current/40 gap-1 border border-dashed border-shell-border rounded-shell">
        <CheckCircle size={24} className="text-current/20" />
        <p className="text-xs font-semibold">No folders found matching your filters.</p>
      </div>
    );
  }

  const allSelected = selectedIds.size === sortedTargets.length;

  return (
    <div className="border border-shell-border rounded-shell overflow-hidden bg-shell-surface">
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-shell-border bg-shell-sidebar/50 px-4 py-2.5 text-xs font-semibold text-current/50 select-none">
        <div className="flex items-center gap-3 min-w-0 mr-4">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-2 hover:text-current transition-colors text-left shrink-0"
          >
            {allSelected ? (
              <CheckSquare size={14} className="text-shell-accent" />
            ) : selectedIds.size > 0 ? (
              <div className="h-3.5 w-3.5 flex items-center justify-center rounded-sm bg-shell-accent text-white">
                <div className="h-0.5 w-2 bg-white rounded-full"></div>
              </div>
            ) : (
              <Square size={14} />
            )}
          </button>
          <button
            onClick={() => toggleSort('name')}
            className="flex items-center gap-1 hover:text-current transition-colors text-left"
          >
            <span>Target Folder</span>
            {sortBy === 'name' && (
              sortOrder === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
            )}
          </button>
        </div>

        <div className="flex items-center gap-6 shrink-0 font-semibold">
          <button
            onClick={() => toggleSort('category')}
            className="flex items-center gap-1 hover:text-current transition-colors"
          >
            <span>Category</span>
            {sortBy === 'category' && (
              sortOrder === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
            )}
          </button>
          <button
            onClick={() => toggleSort('size')}
            className="flex items-center gap-1 hover:text-current transition-colors w-20 justify-end"
          >
            <span>Size</span>
            {sortBy === 'size' && (
              sortOrder === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
            )}
          </button>
        </div>
      </div>

      {/* List Entries */}
      <div className="divide-y divide-shell-border">
        {sortedTargets.map((target) => {
          const isSelected = selectedIds.has(target.id);
          const hasError = errors[target.id] !== undefined;

          return (
            <div
              key={target.id}
              className={`flex items-start justify-between px-4 py-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                isSelected ? 'bg-shell-accent/5' : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 mr-4">
                <button
                  onClick={() => handleToggleSelect(target.id)}
                  className="mt-0.5 text-current/60 hover:text-shell-accent transition-colors shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare size={14} className="text-shell-accent" />
                  ) : (
                    <Square size={14} />
                  )}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-current truncate">{target.name}</span>
                    {target.category === 'Application' && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-medium">
                        <AlertTriangle size={8} />
                        Resets App
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-current/50 mb-1 leading-snug">{target.description}</p>
                  <span className="text-[10px] font-mono text-current/45 bg-shell-sidebar px-1.5 py-0.5 rounded border border-shell-border break-all">
                    {target.path}
                  </span>

                  {hasError && (
                    <p className="text-[11px] text-red-500 mt-1 font-medium">
                      Error: {errors[target.id]}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 pt-0.5">
                <span className="flex items-center gap-1.5 text-xs text-current/60">
                  {getCategoryIcon(target.category)}
                  {target.category}
                </span>
                <span className="w-20 text-right font-semibold text-current">
                  {formatBytes(target.sizeInBytes)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
