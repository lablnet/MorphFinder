import React from 'react';
import { Download, FileText, Home, LayoutGrid, Monitor, type LucideIcon } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { SIDEBAR_TOOLS } from '../sidebarConfig';
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
        {SIDEBAR_TOOLS.map((item) => (
          <SidebarRow
            key={item.path}
            label={item.label}
            path={item.path}
            icon={item.icon}
            isActive={activePath === item.path}
            onClick={() => onNavigate(item.path)}
          />
        ))}
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
        'flex h-7 items-center gap-2 rounded px-2 text-left w-full',
        isActive ? 'bg-shell-accent/15 font-semibold text-shell-accent' : 'hover:bg-black/5 dark:hover:bg-white/5 text-current/80 hover:text-current',
      )}
    >
      <Icon size={14} />
      <span className="truncate">{label}</span>
    </button>
  );
}
export default FinderSidebar;
