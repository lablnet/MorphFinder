import type { DuplicateProgressState } from '@renderer/hooks/duplicates/useDuplicateFinder';

export function DuplicateProgress({ progress }: { progress: DuplicateProgressState | null }): React.JSX.Element {
  return (
    <>
      {progress !== null ? (
        <div className="mb-4 rounded-shell border border-shell-border bg-shell-sidebar/35 p-3 text-xs text-current/60">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold capitalize text-current">{progress.phase}</span>
            <span>
              {progress.groupsFound} duplicate group{progress.groupsFound === 1 ? '' : 's'} found so far
            </span>
          </div>
          {progress.currentPath.length > 0 ? <div className="mt-1 truncate font-mono text-[10px] text-current/40">{progress.currentPath}</div> : null}
        </div>
      ) : null}
    </>
  );
}
