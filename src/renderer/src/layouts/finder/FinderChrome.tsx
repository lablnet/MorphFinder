import type { ShellRegionProps } from '../types';

/** Traffic lights are drawn natively (see main/window/createMainWindow.ts,
 *  trafficLightPosition); this is just the draggable strip that clears them. */
export function FinderChrome({ children }: ShellRegionProps): React.JSX.Element {
  return (
    <div
      className="flex h-11 shrink-0 items-center justify-center border-b border-shell-border bg-shell-sidebar pl-20"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
