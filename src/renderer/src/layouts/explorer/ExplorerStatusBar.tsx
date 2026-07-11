import type { ShellRegionProps } from '../types';

export function ExplorerStatusBar({ children }: ShellRegionProps): React.JSX.Element {
  return (
    <div className="flex h-7 shrink-0 items-center border-t border-shell-border bg-[#f6f6f6] px-4 text-xs text-current/70 dark:bg-[#242424]">
      {children}
    </div>
  );
}
