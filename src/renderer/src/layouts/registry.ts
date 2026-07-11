import type { UIShell } from '@shared/types/layout';
import type { ShellDefinition } from './types';
import { finderShell } from './finder';
import { explorerShell } from './explorer';
import { dolphinShell } from './dolphin';

/** ShellLayout renders whatever this map returns for the active shell.
 *  A fourth skin is one folder plus one line here — no if/else anywhere. */
export const shellRegistry: Record<UIShell, ShellDefinition> = {
  finder: finderShell,
  explorer: explorerShell,
  dolphin: dolphinShell,
};
