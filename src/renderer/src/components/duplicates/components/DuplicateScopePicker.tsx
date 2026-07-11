import { FolderOpen } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { Button } from '@renderer/components/ui/Button';
import { duplicateScanScopeOptions, duplicateScopeDescription, type DuplicateScanScope } from '@renderer/lib/duplicateFinderUtils';

export function DuplicateScopePicker({
  scanScope,
  customFolder,
  disabled,
  onScopeChange,
  onChooseFolder,
}: {
  scanScope: DuplicateScanScope;
  customFolder: string | null;
  disabled: boolean;
  onScopeChange: (scope: DuplicateScanScope) => void;
  onChooseFolder: () => void;
}): React.JSX.Element {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-shell border border-shell-border bg-shell-sidebar/25 p-3">
      <div className="min-w-0">
        <div className="text-xs font-semibold text-current">Scan Scope</div>
        <div className="truncate text-[11px] text-current/45">{duplicateScopeDescription(scanScope, customFolder)}</div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-shell border border-shell-border bg-shell-surface p-0.5">
          {duplicateScanScopeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onScopeChange(option.id)}
              className={cn(
                'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                scanScope === option.id ? 'bg-shell-accent text-white' : 'text-current/60 hover:bg-shell-sidebar hover:text-current',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Button onClick={onChooseFolder} disabled={disabled} variant="outline" className="gap-2">
          <FolderOpen size={14} />
          Choose Folder
        </Button>
      </div>
    </div>
  );
}
