import { Plus, X } from 'lucide-react';
import { cn } from '@lablnet/ui';
import type { TabMetadata } from '@shared/types/tabs';

export interface TabStripProps {
  tabs: TabMetadata[];
  activeTabId: string | null;
  onActivate: (tabId: string) => void;
  onClose: (tabId: string) => void;
  onNew: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

/**
 * Shell-agnostic tab strip: middle-click and the × button both close, dragging
 * reorders. Every visual difference between shells comes from `--shell-*` tokens
 * and the `roundedTabs` flag each ShellDefinition passes in — no per-shell branch here.
 */
export function TabStrip({ tabs, activeTabId, onActivate, onClose, onNew, onReorder }: TabStripProps): React.JSX.Element {
  return (
    <div className="flex h-9 items-center gap-1 border-b border-shell-border bg-shell-sidebar px-2" role="tablist">
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeTabId}
          draggable
          onDragStart={(event) => event.dataTransfer.setData('text/tab-index', String(index))}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const fromIndex = Number(event.dataTransfer.getData('text/tab-index'));
            if (!Number.isNaN(fromIndex)) onReorder(fromIndex, index);
          }}
          onClick={() => onActivate(tab.id)}
          onMouseDown={(event) => {
            if (event.button === 1) onClose(tab.id); // middle-click closes
          }}
          className={cn(
            'group flex max-w-[180px] cursor-default items-center gap-1.5 truncate rounded-shell px-3 py-1 text-sm',
            tab.id === activeTabId
              ? 'bg-shell-surface font-medium text-current'
              : 'text-current/70 hover:bg-shell-surface/60',
          )}
        >
          <span className="truncate">{tab.title}</span>
          <button
            type="button"
            aria-label={`Close ${tab.title}`}
            onClick={(event) => {
              event.stopPropagation();
              onClose(tab.id);
            }}
            className="ml-auto shrink-0 rounded p-0.5 opacity-0 hover:bg-black/10 group-hover:opacity-100"
          >
            <X size={12} />
          </button>
        </div>
      ))}
      <button
        type="button"
        aria-label="New tab"
        onClick={onNew}
        className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-shell text-current/60 hover:bg-shell-surface/60"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
