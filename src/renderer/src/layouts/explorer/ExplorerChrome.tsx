import type { ShellRegionProps } from '../types';

/** Windows draws its own min/max/close via titleBarOverlay (see createMainWindow.ts);
 *  this strip reserves the space and hosts the command bar row. */
export function ExplorerChrome({ children }: ShellRegionProps): React.JSX.Element {
  return (
    <div
      className="flex h-12 shrink-0 items-end gap-2 border-b border-shell-border bg-[#f3f3f3] px-3 pb-1 dark:bg-[#1f1f1f]"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
