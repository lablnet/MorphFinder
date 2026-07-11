import React from 'react';
import {
  ClipboardPaste,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  FolderPlus,
  Pencil,
  RefreshCw,
  Scissors,
  Trash2,
  Pin,
  PinOff,
} from 'lucide-react';
import { cn } from '@lablnet/ui';
import { Button } from '../ui/Button';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { useAppStore } from '@renderer/store';

export type FileContextAction =
  | 'open'
  | 'open-in-new-tab'
  | 'open-in-new-window'
  | 'open-with-system'
  | 'rename'
  | 'copy'
  | 'cut'
  | 'paste'
  | 'trash'
  | 'details'
  | 'pin'
  | 'unpin'
  | 'annotate'
  | 'new-folder'
  | 'show-in-folder'
  | 'refresh';

export interface FileContextMenuState {
  x: number;
  y: number;
  hasTarget: boolean;
  canPaste: boolean;
  node?: FileSystemNode | null;
}

interface FileContextMenuProps {
  state: FileContextMenuState;
  onAction: (action: FileContextAction) => void;
  onClose: () => void;
}

const BACKGROUND_ACTIONS: Array<{ action: FileContextAction; label: string; Icon: typeof FolderOpen }> = [
  { action: 'paste', label: 'Paste', Icon: ClipboardPaste },
  { action: 'new-folder', label: 'New Folder', Icon: FolderPlus },
  { action: 'refresh', label: 'Refresh', Icon: RefreshCw },
];

export function FileContextMenu({ state, onAction, onClose }: FileContextMenuProps): React.JSX.Element {
  const pinnedFolders = useAppStore((state) => state.pinnedFolders);
  const isPinned = state.node && state.node.kind === 'directory' && pinnedFolders.includes(state.node.path);

  const targetActions: Array<{ action: FileContextAction; label: string; Icon: any }> = [];

  if (state.node && state.node.kind === 'directory') {
    targetActions.push(
      { action: 'open', label: 'Open', Icon: FolderOpen },
      { action: 'open-in-new-tab', label: 'Open in New Tab', Icon: FolderPlus },
      { action: 'open-in-new-window', label: 'Open in New Window', Icon: ExternalLink }
    );
  } else {
    targetActions.push({ action: 'open', label: 'Open', Icon: FolderOpen });
  }

  targetActions.push(
    { action: 'open-with-system', label: 'Open with System App', Icon: ExternalLink },
    { action: 'rename', label: 'Rename', Icon: Pencil },
    { action: 'copy', label: 'Copy', Icon: Copy },
    { action: 'cut', label: 'Cut', Icon: Scissors },
    { action: 'trash', label: 'Move to Trash', Icon: Trash2 },
    { action: 'details', label: 'Details', Icon: FileText }
  );

  if (state.node && state.node.kind === 'directory') {
    if (isPinned) {
      targetActions.push({ action: 'unpin', label: 'Unpin Folder', Icon: PinOff });
    } else {
      targetActions.push({ action: 'pin', label: 'Pin Folder', Icon: Pin });
    }
  }

  targetActions.push({ action: 'show-in-folder', label: 'Show in Folder', Icon: ExternalLink });

  const actions = state.hasTarget ? [...targetActions, ...BACKGROUND_ACTIONS] : BACKGROUND_ACTIONS;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose} onContextMenu={(event) => event.preventDefault()}>
      <div
        role="menu"
        className="fixed min-w-48 rounded-shell border border-shell-border bg-shell-surface py-1 text-sm shadow-xl"
        style={{ left: state.x, top: state.y }}
        onClick={(event) => event.stopPropagation()}
      >
        {actions.map(({ action, label, Icon }) => {
          const disabled = action === 'paste' && !state.canPaste;
          return (
            <Button
              key={action}
              role="menuitem"
              disabled={disabled}
              onClick={() => onAction(action)}
              variant="ghost"
              className={cn(
                'flex h-8 w-full items-center justify-start gap-2 px-3 text-left outline-none rounded-none',
                disabled ? 'cursor-default opacity-35' : 'hover:bg-shell-sidebar focus:bg-shell-sidebar',
              )}
            >
              <Icon size={15} className="shrink-0 text-current/65" />
              <span className="truncate">{label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
