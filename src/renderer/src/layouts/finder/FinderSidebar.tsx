import { Download, FileText, Home, LayoutGrid, Monitor, Trash2, PieChart, type LucideIcon } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { CACHE_CLEANER_PATH, SPACE_ANALYZER_PATH } from '@shared/constants';
import type { SidebarProps } from '../types';

export function FinderSidebar({ wellKnownDirs, activePath, onNavigate }: SidebarProps): React.JSX.Element {
  const favorites = wellKnownDirs === null
    ? []
    : [
        { label: 'Home', path: wellKnownDirs.home, icon: Home },
        { label: 'Desktop', path: wellKnownDirs.desktop, icon: Monitor },
        { label: 'Documents', path: wellKnownDirs.documents, icon: FileText },
        { label: 'Downloads', path: wellKnownDirs.downloads, icon: Download },
      ];

  return (
    <aside className="flex w-52 shrink-0 flex-col gap-4 overflow-y-auto border-r border-shell-border bg-shell-sidebar p-3 text-sm">
      <SidebarGroup title="Favorites">
        {favorites.map((item) => (
          <SidebarRow key={item.path} {...item} isActive={item.path === activePath} onClick={() => onNavigate(item.path)} />
        ))}
      </SidebarGroup>
      <SidebarGroup title="Locations">
        <SidebarRow label="Macintosh HD" path="/" icon={LayoutGrid} isActive={activePath === '/'} onClick={() => onNavigate('/')} />
      </SidebarGroup>
      <SidebarGroup title="Tools">
        <SidebarRow
          label="Cache Cleaner"
          path={CACHE_CLEANER_PATH}
          icon={Trash2}
          isActive={activePath === CACHE_CLEANER_PATH}
          onClick={() => onNavigate(CACHE_CLEANER_PATH)}
        />
        <SidebarRow
          label="Space Analyzer"
          path={SPACE_ANALYZER_PATH}
          icon={PieChart}
          isActive={activePath === SPACE_ANALYZER_PATH}
          onClick={() => onNavigate(SPACE_ANALYZER_PATH)}
        />
      </SidebarGroup>
    </aside>
  );
}

function SidebarGroup({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div>
      <p className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-current/40">{title}</p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

interface SidebarRowProps {
  label: string;
  path: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

function SidebarRow({ label, icon: Icon, isActive, onClick }: SidebarRowProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-shell px-2 py-1 text-left',
        isActive ? 'bg-shell-accent/15 font-medium text-shell-accent' : 'hover:bg-black/5',
      )}
    >
      <Icon size={15} />
      <span className="truncate">{label}</span>
    </button>
  );
}
