import type { ShellRegionProps } from '../types';

export function FinderStatusBar({ children }: ShellRegionProps): React.JSX.Element {
  return (
    <div className="flex h-6 shrink-0 items-center border-t border-shell-border bg-shell-sidebar px-3 text-xs text-current/60">
      {children}
    </div>
  );
}
