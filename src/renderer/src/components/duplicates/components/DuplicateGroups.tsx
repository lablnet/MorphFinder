import { Check } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { FileIcon } from '@renderer/components/fileicons/FileIcon';
import { formatBytes, formatModifiedDate } from '@renderer/lib/format';
import { duplicateFileNode } from '@renderer/lib/duplicateFinderUtils';
import type { DuplicateGroup } from '@shared/types/duplicates';

export function DuplicateGroups({
  groups,
  selectedPaths,
  togglePath,
}: {
  groups: DuplicateGroup[];
  selectedPaths: Set<string>;
  togglePath: (path: string) => void;
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id} className="overflow-hidden rounded-shell border border-shell-border bg-shell-sidebar/25">
          <div className="flex items-center justify-between border-b border-shell-border bg-shell-sidebar/50 px-3 py-2">
            <div className="font-semibold text-current">{group.files.length} copies</div>
            <div className="text-xs text-current/55">{formatBytes(group.sizeInBytes)} each</div>
          </div>
          <div className="divide-y divide-shell-border/70">
            {group.files.map((file, index) => {
              const node = duplicateFileNode(file.path, file.name, file.sizeInBytes, file.modifiedAt);
              const checked = selectedPaths.has(file.path);
              return (
                <label
                  key={file.path}
                  className={cn('flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-shell-sidebar', checked && 'bg-shell-accent/10')}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      togglePath(file.path);
                    }}
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                      checked
                        ? 'border-shell-accent bg-shell-accent text-white'
                        : 'border-shell-border bg-shell-surface text-transparent hover:border-shell-accent/70',
                    )}
                    aria-pressed={checked}
                    title={checked ? 'Selected for trash' : 'Select duplicate'}
                  >
                    {checked ? <Check size={14} /> : null}
                  </button>
                  <FileIcon node={node} size={18} className="shrink-0 text-current/70" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{file.name}</span>
                      {index === 0 ? <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-600">Newest</span> : null}
                    </div>
                    <div className="truncate text-xs text-current/45">{file.path}</div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-current/55">{formatModifiedDate(file.modifiedAt)}</div>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
