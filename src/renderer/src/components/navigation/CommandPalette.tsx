import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { useCommandPalette } from '../../hooks/ui/useCommandPalette';
import type { FileSystemNode } from '@shared/types/fileSystem';

// Import icons specifically to prevent bundle size inflation
import {
  Home,
  Monitor,
  FileText,
  Download,
  HardDrive,
  Trash2,
  Plus,
  X,
  RefreshCw,
  FolderPlus,
  Eye,
  LayoutGrid,
  SunMoon,
  Folder,
  File,
  PieChart,
  Code2,
  Sparkles,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Search,
  Home,
  Monitor,
  FileText,
  Download,
  HardDrive,
  Trash2,
  Plus,
  X,
  RefreshCw,
  FolderPlus,
  Eye,
  LayoutGrid,
  SunMoon,
  Folder,
  File,
  PieChart,
  Code2,
  Sparkles,
};

interface CommandPaletteProps {
  currentNodes: FileSystemNode[];
  onOpenNode: (node: FileSystemNode) => void;
  onCreateFolder?: () => void;
  onRefresh?: () => void;
}

export function CommandPalette(props: CommandPaletteProps): React.JSX.Element | null {
  const {
    isOpen,
    searchQuery,
    setSearchQuery,
    activeIndex,
    filteredItems,
    selectIndex,
    selectItem,
    activeShell,
    close,
  } = useCommandPalette(props);

  if (!isOpen) return null;

  const shell = activeShell === 'explorer' || activeShell === 'dolphin' ? activeShell : 'finder';

  // Layout Styles based on active shell
  const overlayClass = {
    finder: 'fixed inset-0 z-50 flex items-start justify-center bg-black/25 backdrop-blur-[1px] p-4 transition-opacity duration-200 animate-fade-in',
    explorer: 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity duration-200 animate-fade-in',
    dolphin: 'fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-0 transition-opacity duration-200 animate-fade-in',
  }[shell];

  const containerClass = {
    finder: 'mt-[12vh] w-full max-w-[640px] rounded-2xl border shadow-2xl flex flex-col backdrop-blur-2xl text-current overflow-hidden animate-scale-up',
    explorer: 'w-full max-w-[600px] rounded-lg border border-[#0067c0]/40 dark:border-[#4cc2ff]/40 shadow-2xl flex flex-col bg-[#fafafa] dark:bg-[#1f1f1f] text-current overflow-hidden animate-scale-up',
    dolphin: 'w-full max-w-[700px] rounded-b-xl border-x border-b border-shell-border shadow-xl flex flex-col bg-shell-surface text-current overflow-hidden animate-slide-down',
  }[shell];

  const searchContainerClass = {
    finder: 'flex items-center gap-3 px-4 py-3.5 border-b bg-transparent',
    explorer: 'flex items-center gap-3 px-4 py-3 border-b border-shell-border bg-white dark:bg-[#2c2c2c]',
    dolphin: 'flex items-center gap-3 px-4 py-2.5 border-b border-shell-border bg-shell-sidebar/30',
  }[shell];

  const inputClass = {
    finder: 'flex-1 bg-transparent border-none text-current placeholder-current/35 focus:outline-none focus:ring-0 text-base font-normal tracking-wide',
    explorer: 'flex-1 bg-transparent border-none text-current placeholder-current/40 focus:outline-none focus:ring-0 text-sm font-light',
    dolphin: 'flex-1 bg-transparent border-none text-current placeholder-current/45 focus:outline-none focus:ring-0 text-sm font-medium',
  }[shell];

  const listContainerClass = {
    finder: 'flex-1 max-h-[380px] overflow-y-auto custom-scrollbar p-2 space-y-0.5',
    explorer: 'flex-1 max-h-[340px] overflow-y-auto custom-scrollbar p-3 space-y-1',
    dolphin: 'flex-1 max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-0.5',
  }[shell];

  const categoryHeaderClass = {
    finder: 'text-[10px] font-bold text-current/35 tracking-wider uppercase px-3 py-1.5 mt-2 first:mt-1',
    explorer: 'text-xs font-semibold text-[#0067c0] dark:text-[#4cc2ff] px-2 py-1 mt-3 first:mt-0',
    dolphin: 'text-[11px] font-bold text-current/40 uppercase px-3 py-1 mt-2 first:mt-1',
  }[shell];

  const itemClass = (index: number) => {
    const isActive = index === activeIndex;
    return cn(
      'w-full flex items-center justify-between px-3 py-2 text-left cursor-pointer transition-all duration-100 rounded-shell border border-transparent outline-none select-none',
      isActive && {
        finder: 'bg-blue-500 text-white shadow-sm',
        explorer: 'bg-black/5 dark:bg-white/5 border-l-4 border-l-[#0067c0] dark:border-l-[#4cc2ff] rounded-none pl-2 bg-[#eaeaea] dark:bg-[#2d2d2d]',
        dolphin: 'bg-[color:var(--shell-accent)]/15 text-[color:var(--shell-accent)]',
      }[shell],
      !isActive && 'hover:bg-black/5 dark:hover:bg-white/5'
    );
  };

  const keyboardHintClass = (isActive: boolean) => cn(
    'hidden sm:flex items-center gap-1 text-[10px] font-mono select-none px-1.5 py-0.5 rounded border',
    isActive
      ? {
        finder: 'border-white/30 text-white/70 bg-white/10',
        explorer: 'border-shell-border text-current/50 bg-black/5 dark:bg-white/5',
        dolphin: 'border-shell-border text-current/50 bg-black/5 dark:bg-white/5',
      }[shell]
      : 'border-shell-border text-current/40 bg-black/5 dark:bg-white/5'
  );

  // Group items by category to render section headers
  const groupedItems: { [key: string]: Array<{ item: typeof filteredItems[0]; index: number }> } = {};
  filteredItems.forEach((item, index) => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category]!.push({ item, index });
  });

  return (
    <div className={overlayClass} onClick={close} role="presentation" data-shell={shell}>
      <div
        className={containerClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={shell === 'finder' ? {
          backgroundColor: 'color-mix(in srgb, var(--shell-surface) 90%, transparent)',
          borderColor: 'color-mix(in srgb, var(--shell-border) 80%, transparent)',
        } : undefined}
      >
        {/* Search Input Area */}
        <div
          className={searchContainerClass}
          style={shell === 'finder' ? {
            borderBottomColor: 'color-mix(in srgb, var(--shell-border) 60%, transparent)',
          } : undefined}
        >
          <Search size={shell === 'finder' ? 18 : 16} className="text-current/35 shrink-0" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              shell === 'finder'
                ? 'Spotlight Search...'
                : shell === 'explorer'
                  ? 'Search MorphFinder...'
                  : 'Search commands or files...'
            }
            className={inputClass}
          />
          <button
            onClick={close}
            className="text-current/35 hover:text-current/60 transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results List */}
        <div className={listContainerClass}>
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-current/45 text-xs">
              No matching commands or files found.
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, itemsList]) => (
              <div key={category} className="flex flex-col">
                <div className={categoryHeaderClass}>{category}</div>
                {itemsList.map(({ item, index }) => {
                  const IconComponent = ICON_MAP[item.icon] ?? File;
                  const isActive = index === activeIndex;
                  return (
                    <div
                      key={item.id}
                      className={itemClass(index)}
                      onClick={() => selectItem(item)}
                      onMouseEnter={() => selectIndex(index)}
                      role="option"
                      aria-selected={isActive}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <IconComponent
                           size={shell === 'finder' ? 16 : 14}
                           className={cn(
                             'shrink-0',
                             isActive ? 'text-inherit' : 'text-current/55'
                           )}
                        />
                        <div className="min-w-0 flex flex-col">
                          <span className="font-medium truncate text-xs sm:text-sm">
                            {item.label}
                          </span>
                          {item.description && (
                            <span
                              className={cn(
                                'text-[10px] truncate',
                                isActive ? 'text-inherit/70' : 'text-current/40'
                              )}
                            >
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Enter Hint for active items */}
                      {isActive && (
                        <div className={keyboardHintClass(isActive)}>
                          <span>Enter</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Help Status Bar */}
        <div
          className="flex items-center justify-between border-t border-shell-border px-4 py-2 text-[10px] text-current/40 shrink-0"
          style={{ backgroundColor: 'color-mix(in srgb, var(--shell-sidebar) 20%, transparent)' }}
        >
          <div className="flex items-center gap-1">
            <span>Toggle:</span>
            <kbd className="font-mono bg-shell-sidebar border border-shell-border rounded px-1">
              {navigator.platform.toLowerCase().includes('mac') ? '⌘ K' : 'Ctrl K'}
            </kbd>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-shell-sidebar border border-shell-border rounded px-1">↑↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-shell-sidebar border border-shell-border rounded px-1">Esc</kbd>
              <span>to close</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
