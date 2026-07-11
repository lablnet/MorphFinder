import { Monitor, Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@lablnet/ui';
import type { UIThemeMode } from '@shared/types/layout';

export interface ThemeToggleProps {
  mode: UIThemeMode;
  onChange: (mode: UIThemeMode) => void;
}

const MODE_ICON: Record<UIThemeMode, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };

/** Three-way light/dark/system control — see hooks/useTheme.ts for how the choice
 *  gets resolved and applied. This component only ever reports the user's pick. */
export function ThemeToggle({ mode, onChange }: ThemeToggleProps): React.JSX.Element {
  const Icon = MODE_ICON[mode];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-7 w-7 items-center justify-center rounded-shell text-current/70 hover:bg-black/5"
        aria-label="Change theme"
      >
        <Icon size={14} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={mode} onValueChange={(value) => onChange(value as UIThemeMode)}>
          <DropdownMenuRadioItem value="light">
            <Sun size={14} className="mr-2" /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon size={14} className="mr-2" /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor size={14} className="mr-2" /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
