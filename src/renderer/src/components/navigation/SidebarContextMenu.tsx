import React from 'react';
import { FolderPlus, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppStore } from '@renderer/store';
import { ipc } from '@renderer/services/ipc';

export interface SidebarContextMenuState {
  x: number;
  y: number;
  path: string;
}

interface SidebarContextMenuProps {
  state: SidebarContextMenuState;
  onClose: () => void;
}

export function SidebarContextMenu({ state, onClose }: SidebarContextMenuProps): React.JSX.Element {
  const openTab = useAppStore((state) => state.openTab);

  const handleOpenInNewTab = () => {
    openTab(state.path, { activate: true });
    onClose();
  };

  const handleOpenInNewWindow = () => {
    void ipc.invoke('shell:newWindow', { path: state.path });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
      onContextMenu={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div
        role="menu"
        className="fixed min-w-48 rounded-shell border border-shell-border bg-shell-surface py-1 text-sm shadow-xl"
        style={{ left: state.x, top: state.y }}
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          role="menuitem"
          onClick={handleOpenInNewTab}
          variant="ghost"
          className="flex h-8 w-full items-center justify-start gap-2 px-3 text-left outline-none rounded-none hover:bg-shell-sidebar focus:bg-shell-sidebar"
        >
          <FolderPlus size={15} className="shrink-0 text-current/65" />
          <span className="truncate">Open in New Tab</span>
        </Button>
        <Button
          role="menuitem"
          onClick={handleOpenInNewWindow}
          variant="ghost"
          className="flex h-8 w-full items-center justify-start gap-2 px-3 text-left outline-none rounded-none hover:bg-shell-sidebar focus:bg-shell-sidebar"
        >
          <ExternalLink size={15} className="shrink-0 text-current/65" />
          <span className="truncate">Open in New Window</span>
        </Button>
      </div>
    </div>
  );
}
