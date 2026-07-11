import { useEffect } from 'react';
import { useAppStore } from '@renderer/store';
import { shellRegistry } from '@renderer/layouts/registry';
import type { ShellDefinition } from '@renderer/layouts/types';
import type { UIShell } from '@shared/types/layout';

export interface UseLayoutShellResult {
  shell: ShellDefinition;
  setShell: (id: UIShell) => void;
  cycleShell: () => void;
}

/** Resolves the active ShellDefinition and publishes its tokens as CSS variables —
 *  this is the only place shell tokens touch the DOM; everything else reads var(--shell-*). */
export function useLayoutShell(): UseLayoutShellResult {
  const activeShell = useAppStore((state) => state.activeShell);
  const setShell = useAppStore((state) => state.setShell);
  const cycleShell = useAppStore((state) => state.cycleShell);
  const shell = shellRegistry[activeShell];

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--shell-accent', shell.tokens.accent);
    root.setProperty('--shell-font', shell.tokens.font);
    root.setProperty('--shell-radius', shell.tokens.radius);
    root.setProperty('--shell-row-height', shell.tokens.rowHeight);
  }, [shell]);

  return { shell, setShell, cycleShell };
}
