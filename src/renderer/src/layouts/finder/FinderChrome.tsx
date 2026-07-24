import { cn } from '@lablnet/ui';
import type { ShellRegionProps } from '../types';

/** Traffic lights are drawn natively (see main/window/createMainWindow.ts,
 *  trafficLightPosition); this is just the draggable strip that clears them. */
export function FinderChrome({ children }: ShellRegionProps): React.JSX.Element {
  const isMac = typeof navigator !== 'undefined' && (/mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent));
  return (
    <div
      className={cn(
        "flex h-11 shrink-0 items-center justify-center border-b border-shell-border bg-shell-sidebar pr-2",
        isMac ? "pl-20" : "pl-2"
      )}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
