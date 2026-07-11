import { cn } from '@lablnet/ui';
import type { ShellRegionProps } from '../types';

/** Windows draws its own min/max/close via titleBarOverlay (see createMainWindow.ts);
 *  this strip reserves the space and hosts the command bar row. */
export function ExplorerChrome({ children }: ShellRegionProps): React.JSX.Element {
  const isMac = navigator.platform.toLowerCase().includes('mac');
  return (
    <div
      className={cn(
        "flex h-12 shrink-0 items-end gap-2 border-b border-shell-border bg-[#f3f3f3] px-3 pb-1 dark:bg-[#1f1f1f]",
        isMac && "pl-20"
      )}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
