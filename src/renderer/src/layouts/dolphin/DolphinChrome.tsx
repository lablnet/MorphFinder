import { cn } from '@lablnet/ui';
import type { ShellRegionProps } from '../types';

/** Linux window managers draw their own decorations; this strip just hosts the toolbar row. */
export function DolphinChrome({ children }: ShellRegionProps): React.JSX.Element {
  const isMac = typeof navigator !== 'undefined' && (/mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent));
  return (
    <div
      className={cn(
        "flex h-10 shrink-0 items-center gap-2 border-b border-shell-border bg-shell-surface pr-2",
        isMac ? "pl-20" : "pl-2"
      )}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
