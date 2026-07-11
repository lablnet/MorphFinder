import React from 'react';
import { FolderPlus, Trash2, Grid2X2, List, Columns3, RefreshCw } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { HistoryButtons } from './HistoryButtons';
import { PathBreadcrumb } from './PathBreadcrumb';
import { ShellSwitcher } from '../chrome/ShellSwitcher';
import { ThemeToggle } from '../chrome/ThemeToggle';
import { Button } from '../ui/Button';
import type { ViewMode, UIShell, UIThemeMode } from '@shared/types/layout';

export interface FileToolbarProps {
  shellId: UIShell;
  setShell: (shell: UIShell) => void;
  activePath: string;
  navigate: (path: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  themeMode: UIThemeMode;
  onThemeChange: (mode: UIThemeMode) => void;
  isVirtualLocation: boolean;
  onCreateFolder: () => void;
  selectedPathsCount: number;
  onTrashSelected: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onRefresh: () => void;
  gitRadarNode?: React.ReactNode;
}

const VIEW_OPTIONS: Array<{ mode: ViewMode; label: string; Icon: typeof Grid2X2 }> = [
  { mode: 'icons', label: 'Icons', Icon: Grid2X2 },
  { mode: 'list', label: 'List', Icon: List },
  { mode: 'columns', label: 'Columns', Icon: Columns3 },
];

export function FileToolbar({
  shellId,
  setShell,
  activePath,
  navigate,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  themeMode,
  onThemeChange,
  isVirtualLocation,
  onCreateFolder,
  selectedPathsCount,
  onTrashSelected,
  viewMode,
  onViewModeChange,
  onRefresh,
  gitRadarNode,
}: FileToolbarProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 px-2',
        shellId === 'explorer' && 'h-12 border-b border-shell-border bg-[#f9f9f9] px-4 dark:bg-[#202020]',
      )}
    >
      <HistoryButtons
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onBack={onBack}
        onForward={onForward}
        variant={shellId === 'explorer' ? 'explorer' : 'default'}
      />
      <div
        className={cn(
          'min-w-0 flex-1 overflow-hidden',
          shellId === 'explorer' && 'rounded border border-shell-border bg-white/80 dark:bg-[#2b2b2b]',
        )}
      >
        <PathBreadcrumb path={activePath} onNavigate={navigate} />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <ShellSwitcher activeShell={shellId} onSelect={setShell} />
        <ThemeToggle mode={themeMode} onChange={onThemeChange} />
        
        <Button
          title="New Folder"
          aria-label="New Folder"
          disabled={isVirtualLocation}
          onClick={onCreateFolder}
          size="icon"
          shellId={shellId}
        >
          <FolderPlus size={15} />
        </Button>

        <Button
          title="Move to Trash"
          aria-label="Move to Trash"
          disabled={selectedPathsCount === 0}
          onClick={onTrashSelected}
          size="icon"
          shellId={shellId}
        >
          <Trash2 size={15} />
        </Button>

        {VIEW_OPTIONS.map(({ mode, label, Icon }) => (
          <Button
            key={mode}
            title={label}
            aria-label={label}
            onClick={() => onViewModeChange(mode)}
            size="icon"
            shellId={shellId}
            className={cn(
              viewMode === mode && (
                shellId === 'explorer'
                  ? 'bg-black/10 text-current dark:bg-white/10'
                  : 'bg-shell-sidebar text-current'
              )
            )}
          >
            <Icon size={15} />
          </Button>
        ))}

        <Button
          title="Refresh"
          aria-label="Refresh"
          onClick={onRefresh}
          size="icon"
          shellId={shellId}
        >
          <RefreshCw size={15} />
        </Button>

        {gitRadarNode}
      </div>
    </div>
  );
}
