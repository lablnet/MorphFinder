import { Download, FileText, Laptop, Star, Trash2, type LucideIcon } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { THIS_PC_PATH, CACHE_CLEANER_PATH } from '@shared/constants';
import type { SidebarProps } from '../types';

export function ExplorerSidebar({ wellKnownDirs, activePath, onNavigate }: SidebarProps): React.JSX.Element {
  const quickAccess = wellKnownDirs === null
    ? []
    : [
        { label: 'Desktop', path: wellKnownDirs.desktop, icon: Star },
        { label: 'Documents', path: wellKnownDirs.documents, icon: FileText },
        { label: 'Downloads', path: wellKnownDirs.downloads, icon: Download },
      ];

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-shell-border bg-shell-sidebar px-3 py-4 text-sm">
      <SidebarGroup title="Quick access">
        {quickAccess.map((item) => (
          <SidebarRow key={item.path} {...item} isActive={item.path === activePath} onClick={() => onNavigate(item.path)} />
        ))}
      </SidebarGroup>
      <SidebarGroup title="This PC">
        <SidebarRow
          label="This PC"
          path={THIS_PC_PATH}
          icon={Laptop}
          isActive={activePath === THIS_PC_PATH}
          onClick={() => onNavigate(THIS_PC_PATH)}
        />
      </SidebarGroup>
      <SidebarGroup title="Tools">
        <SidebarRow
          label="Cache Cleaner"
          path={CACHE_CLEANER_PATH}
          icon={Trash2}
          isActive={activePath === CACHE_CLEANER_PATH}
          onClick={() => onNavigate(CACHE_CLEANER_PATH)}
        />
      </SidebarGroup>
    </aside>
  );
}

function SidebarGroup({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div>
      <p className="mb-2 px-2 text-xs font-semibold text-current/65">{title}</p>
      <div className="flex flex-col gap-1">{children}</div>
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
        'flex h-9 items-center gap-3 rounded px-2 text-left',
        isActive ? 'bg-[color:var(--shell-accent)]/15 font-medium text-[color:var(--shell-accent)]' : 'hover:bg-black/5 dark:hover:bg-white/5',
      )}
    >
      <Icon size={16} />
      <span className="truncate">{label}</span>
    </button>
  );
}
