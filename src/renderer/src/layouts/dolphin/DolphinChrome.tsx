import { cn } from '@lablnet/ui';
import type { ShellRegionProps } from '../types';

/** Linux window managers draw their own decorations; this strip just hosts the toolbar row. */
export function DolphinChrome({ children }: ShellRegionProps): React.JSX.Element {
  const isMac = navigator.platform.toLowerCase().includes('mac');
  return (
    <div className={cn("flex h-10 shrink-0 items-center gap-2 border-b border-shell-border bg-shell-surface px-2", isMac && "pl-20")}>
      {children}
    </div>
  );
}
