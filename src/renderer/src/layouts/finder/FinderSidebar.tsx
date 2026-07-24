import React, { useState } from 'react';
import { Download, FileText, Home, Monitor, Folder, X, type LucideIcon } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { SIDEBAR_TOOLS } from '../sidebarConfig';
import type { SidebarProps } from '../types';
import { useAppStore } from '@renderer/store';
import { SidebarContextMenu, type SidebarContextMenuState } from '../../components/navigation/SidebarContextMenu';
import { useSystemLocations, getLocationIcon } from '../../hooks/files/useSystemLocations';

export function FinderSidebar({ wellKnownDirs, activePath, onNavigate }: SidebarProps): React.JSX.Element {
  const pinnedFolders = useAppStore((state) => state.pinnedFolders);
  const unpinFolder = useAppStore((state) => state.unpinFolder);
  const [contextMenu, setContextMenu] = useState<SidebarContextMenuState | null>(null);
  const locations = useSystemLocations();

  const favorites = wellKnownDirs === null
    ? []
    : [
        { label: 'Home', path: wellKnownDirs.home, icon: Home },
        { label: 'Desktop', path: wellKnownDirs.desktop, icon: Monitor },
        { label: 'Documents', path: wellKnownDirs.documents, icon: FileText },
        { label: 'Downloads', path: wellKnownDirs.downloads, icon: Download },
      ];

  const handleContextMenu = (path: string, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      path,
    });
  };

  return (
    <aside className="flex w-52 shrink-0 flex-col gap-4 overflow-y-auto border-r border-shell-border bg-shell-sidebar p-3 text-sm">
      <SidebarGroup title="Favorites">
        {favorites.map((item) => (
          <SidebarRow
            key={item.path}
            {...item}
            isActive={item.path === activePath}
            onClick={() => onNavigate(item.path)}
            onContextMenu={(e) => handleContextMenu(item.path, e)}
          />
        ))}
      </SidebarGroup>
      {pinnedFolders.length > 0 && (
        <SidebarGroup title="Pinned">
          {pinnedFolders.map((path) => (
            <SidebarRow
              key={path}
              label={path.split('/').pop() || path}
              path={path}
              icon={Folder}
              isActive={path === activePath}
              onClick={() => onNavigate(path)}
              onUnpin={() => unpinFolder(path)}
              onContextMenu={(e) => handleContextMenu(path, e)}
            />
          ))}
        </SidebarGroup>
      )}
      <SidebarGroup title="Locations">
        {locations.map((loc) => {
          const Icon = getLocationIcon(loc.iconType || 'folder');
          return (
            <SidebarRow
              key={loc.id}
              label={loc.name}
              path={loc.path}
              icon={Icon}
              iconDataUrl={loc.iconDataUrl}
              isActive={activePath === loc.path}
              onClick={() => onNavigate(loc.path)}
              onContextMenu={(e) => handleContextMenu(loc.path, e)}
            />
          );
        })}
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
            onContextMenu={(e) => handleContextMenu(item.path, e)}
          />
        ))}
      </SidebarGroup>

      {contextMenu && (
        <SidebarContextMenu state={contextMenu} onClose={() => setContextMenu(null)} />
      )}
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
  iconDataUrl?: string | null | undefined;
  isActive: boolean;
  onClick: () => void;
  onUnpin?: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
}

function SidebarRow({ label, icon: Icon, iconDataUrl, isActive, onClick, onUnpin, onContextMenu }: SidebarRowProps): React.JSX.Element {
  return (
    <div
      onContextMenu={onContextMenu}
      className="group flex h-7 items-center justify-between w-full rounded hover:bg-black/5 dark:hover:bg-white/5"
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex h-full items-center gap-2 rounded px-2 text-left flex-1 min-w-0',
          isActive ? 'bg-shell-accent/15 font-semibold text-shell-accent' : 'text-current/80 hover:text-current',
        )}
      >
        {iconDataUrl ? (
          <img src={iconDataUrl} alt="" className="h-4 w-4 shrink-0 object-contain" />
        ) : (
          <Icon size={14} className="shrink-0" />
        )}
        <span className="truncate">{label}</span>
      </button>
      {onUnpin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUnpin();
          }}
          className="mr-2 hidden group-hover:flex text-current/40 hover:text-current/80 transition-colors cursor-pointer"
          title="Unpin Folder"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
export default FinderSidebar;
