import { ArrowUp, Eye, Grid2X2, List } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { Button } from '@renderer/components/ui/Button';
import { Input } from '@renderer/components/ui/Input';
import { Switch } from '@renderer/components/ui/Switch';
import { parentFolderPath, type FolderPickerViewMode } from '@renderer/hooks/files/useFolderPicker';

export function FolderPickerToolbar({
  currentPath,
  pathInput,
  isLoading,
  viewMode,
  showHiddenFiles,
  onLoadPath,
  onPathInputChange,
  onPathInputFocusChange,
  onViewModeChange,
  onToggleHiddenFiles,
}: {
  currentPath: string;
  pathInput: string;
  isLoading: boolean;
  viewMode: FolderPickerViewMode;
  showHiddenFiles: boolean;
  onLoadPath: (path: string) => void;
  onPathInputChange: (path: string) => void;
  onPathInputFocusChange: (focused: boolean) => void;
  onViewModeChange: (mode: FolderPickerViewMode) => void;
  onToggleHiddenFiles: () => void;
}): React.JSX.Element {
  const parentPath = parentFolderPath(currentPath);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-shell-border bg-shell-sidebar/25 px-4 py-3">
      <Button onClick={() => onLoadPath(parentPath)} disabled={isLoading || parentPath === currentPath} variant="outline" className="gap-2">
        <ArrowUp size={14} />
        Up
      </Button>
      <Input
        value={pathInput}
        onChange={(event) => onPathInputChange(event.target.value)}
        onFocus={() => onPathInputFocusChange(true)}
        onBlur={() => onPathInputFocusChange(false)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onLoadPath(pathInput);
        }}
        className="h-8 min-w-[220px] flex-1 text-xs"
      />
      <Button onClick={() => onLoadPath(pathInput)} disabled={isLoading || !pathInput.trim()} variant="outline">
        Go
      </Button>
      <div className="ml-auto flex items-center gap-3">
        <div className="flex h-9 items-center gap-2.5 rounded-shell border border-shell-border bg-shell-surface px-3.5">
          <Eye size={16} className="text-current/70" />
          <Switch
            size="sm"
            checked={showHiddenFiles}
            onCheckedChange={onToggleHiddenFiles}
            label="Show hidden"
            id="folder-picker-show-hidden"
          />
        </div>
        <div className="flex items-center rounded-shell border border-shell-border bg-shell-surface p-0.5">
          <Button onClick={() => onViewModeChange('grid')} variant="ghost" size="icon" className={cn('h-7 w-7', viewMode === 'grid' && 'bg-shell-accent/15 text-shell-accent')} title="Grid view">
            <Grid2X2 size={14} />
          </Button>
          <Button onClick={() => onViewModeChange('list')} variant="ghost" size="icon" className={cn('h-7 w-7', viewMode === 'list' && 'bg-shell-accent/15 text-shell-accent')} title="List view">
            <List size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
