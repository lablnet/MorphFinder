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
  RotateCcw,
  FileArchive,
  Archive,
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
  | 'delete-permanently'
  | 'empty-trash'
  | 'restore'
  | 'details'
  | 'pin'
  | 'unpin'
  | 'annotate'
  | 'new-folder'
  | 'show-in-folder'
  | 'compress'
  | 'extract'
  | 'refresh';

export interface FileContextMenuState {
  x: number;
  y: number;
  hasTarget: boolean;
  canPaste: boolean;
  node?: FileSystemNode | null;
  activePath?: string;
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

export function contextActionsForState(state: { hasTarget: boolean; node?: FileSystemNode | null; activePath?: string }): FileContextAction[] {
  const isInTrash = Boolean(
    (state.node && state.node.path.includes('.Trash')) ||
    (state.activePath && state.activePath.includes('.Trash'))
  );
  if (isInTrash) {
    return state.hasTarget
      ? ['open', 'open-with-system', 'restore', 'delete-permanently', 'details', 'show-in-folder']
      : ['empty-trash', 'refresh'];
  }
  if (!state.hasTarget) {
    return ['paste', 'new-folder', 'refresh'];
  }
  const actions: FileContextAction[] = ['open'];
  if (state.node && state.node.kind === 'directory') {
    actions.push('open-in-new-tab', 'open-in-new-window');
  }
  actions.push('open-with-system', 'rename', 'copy', 'cut', 'trash', 'annotate', 'show-in-folder', 'paste', 'new-folder', 'refresh');
  return actions;
}

export function FileContextMenu({ state, onAction, onClose }: FileContextMenuProps): React.JSX.Element {
  const pinnedFolders = useAppStore((storeState) => storeState.pinnedFolders);
  const isPinned = state.node && state.node.kind === 'directory' && pinnedFolders.includes(state.node.path);

  const isInTrash = Boolean(
    (state.node && state.node.path.includes('.Trash')) ||
    (state.activePath && state.activePath.includes('.Trash'))
  );

  let actions: Array<{ action: FileContextAction; label: string; Icon: any }>;

  if (isInTrash) {
    if (state.hasTarget) {
      actions = [
        { action: 'open', label: 'Open', Icon: FolderOpen },
        { action: 'open-with-system', label: 'Open with System App', Icon: ExternalLink },
        { action: 'restore', label: 'Put Back', Icon: RotateCcw },
        { action: 'delete-permanently', label: 'Delete Immediately', Icon: Trash2 },
        { action: 'details', label: 'Details', Icon: FileText },
        { action: 'show-in-folder', label: 'Show in Folder', Icon: ExternalLink },
      ];
    } else {
      actions = [
        { action: 'empty-trash', label: 'Empty Trash', Icon: Trash2 },
        { action: 'refresh', label: 'Refresh', Icon: RefreshCw },
      ];
    }
  } else {
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
      { action: 'cut', label: 'Cut', Icon: Scissors }
    );

    const isArchiveFile =
      state.node &&
      state.node.kind === 'file' &&
      /\.(zip|tar|gz|tgz|7z)$/i.test(state.node.path);

    if (isArchiveFile) {
      targetActions.push({ action: 'extract', label: 'Extract Archive Here', Icon: Archive });
    } else {
      targetActions.push({ action: 'compress', label: 'Compress to ZIP', Icon: FileArchive });
    }

    targetActions.push(
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

    actions = state.hasTarget ? [...targetActions, ...BACKGROUND_ACTIONS] : BACKGROUND_ACTIONS;
  }

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
          const isDanger = action === 'delete-permanently' || action === 'empty-trash';
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
                isDanger && 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
              )}
            >
              <Icon size={15} className={cn('shrink-0', isDanger ? 'text-red-500 dark:text-red-400' : 'text-current/65')} />
              <span className="truncate">{label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
