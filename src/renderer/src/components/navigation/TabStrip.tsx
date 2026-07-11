import { Plus, X } from 'lucide-react';
import { cn } from '@lablnet/ui';
import type { TabMetadata } from '@shared/types/tabs';
import { Button } from '../ui/Button';

export interface TabStripProps {
  tabs: TabMetadata[];
  activeTabId: string | null;
  onActivate: (tabId: string) => void;
  onClose: (tabId: string) => void;
  onNew: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function TabStrip({ tabs, activeTabId, onActivate, onClose, onNew, onReorder }: TabStripProps): React.JSX.Element {
  return (
    <div className="flex h-full w-full items-center gap-1 px-2" role="tablist">
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
          <Button
            aria-label={`Close ${tab.title}`}
            onClick={(event) => {
              event.stopPropagation();
              onClose(tab.id);
            }}
            variant="ghost"
            className="ml-auto shrink-0 rounded p-0.5 opacity-0 hover:bg-black/10 group-hover:opacity-100 h-auto w-auto"
          >
            <X size={12} />
          </Button>
        </div>
      ))}
      <Button
        aria-label="New tab"
        onClick={onNew}
        variant="ghost"
        className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-shell text-current/60 hover:bg-shell-surface/60"
      >
        <Plus size={14} />
      </Button>
    </div>
  );
}
