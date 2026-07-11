import { LayoutGrid } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@lablnet/ui';
import { shellRegistry } from '@renderer/layouts/registry';
import type { UIShell } from '@shared/types/layout';

export interface ShellSwitcherProps {
  activeShell: UIShell;
  onSelect: (shell: UIShell) => void;
}

/** Lets the user pick Finder/Explorer/Dolphin regardless of host OS — the whole
 *  point of MorphFinder. Options are derived from shellRegistry, so a fourth
 *  shell shows up here automatically. */
export function ShellSwitcher({ activeShell, onSelect }: ShellSwitcherProps): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-7 items-center gap-1.5 rounded-shell px-2 text-xs text-current/70 hover:bg-black/5"
        aria-label="Switch shell"
      >
        <LayoutGrid size={14} />
        {shellRegistry[activeShell].label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Shell</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={activeShell} onValueChange={(value) => onSelect(value as UIShell)}>
          {Object.values(shellRegistry).map((shell) => (
            <DropdownMenuRadioItem key={shell.id} value={shell.id}>
              {shell.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuShortcut className="px-2 pb-1">⇧⌘U to cycle</DropdownMenuShortcut>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
