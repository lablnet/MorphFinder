import {
  ClipboardPaste,
  Copy,
  ExternalLink,
  FolderOpen,
  FolderPlus,
  Pencil,
  RefreshCw,
  Scissors,
  Trash2,
} from 'lucide-react';
import { cn } from '@lablnet/ui';
import { Button } from '../ui/Button';

export type FileContextAction =
  | 'open'
  | 'rename'
  | 'copy'
  | 'cut'
  | 'paste'
  | 'trash'
  | 'new-folder'
  | 'show-in-folder'
  | 'refresh';

export interface FileContextMenuState {
  x: number;
  y: number;
  hasTarget: boolean;
  canPaste: boolean;
}

interface FileContextMenuProps {
  state: FileContextMenuState;
  onAction: (action: FileContextAction) => void;
  onClose: () => void;
}

const TARGET_ACTIONS: Array<{ action: FileContextAction; label: string; Icon: typeof FolderOpen }> = [
  { action: 'open', label: 'Open', Icon: FolderOpen },
  { action: 'rename', label: 'Rename', Icon: Pencil },
  { action: 'copy', label: 'Copy', Icon: Copy },
  { action: 'cut', label: 'Cut', Icon: Scissors },
  { action: 'trash', label: 'Move to Trash', Icon: Trash2 },
  { action: 'show-in-folder', label: 'Show in Folder', Icon: ExternalLink },
];

const BACKGROUND_ACTIONS: Array<{ action: FileContextAction; label: string; Icon: typeof FolderOpen }> = [
  { action: 'paste', label: 'Paste', Icon: ClipboardPaste },
  { action: 'new-folder', label: 'New Folder', Icon: FolderPlus },
  { action: 'refresh', label: 'Refresh', Icon: RefreshCw },
];

export function contextActionsForState(state: Pick<FileContextMenuState, 'hasTarget'>): FileContextAction[] {
  const actions = state.hasTarget ? [...TARGET_ACTIONS, ...BACKGROUND_ACTIONS] : BACKGROUND_ACTIONS;
  return actions.map((action) => action.action);
}

export function FileContextMenu({ state, onAction, onClose }: FileContextMenuProps): React.JSX.Element {
  const actions = state.hasTarget ? [...TARGET_ACTIONS, ...BACKGROUND_ACTIONS] : BACKGROUND_ACTIONS;

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
