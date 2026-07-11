import { useEffect } from 'react';
import { useAppStore } from '@renderer/store';
import type { UIThemeMode } from '@shared/types/layout';

/**
 * Theme is deliberately a separate axis from the Tri-UI shell (see useLayoutShell):
 * shell picks *which app* you're emulating, theme picks *light or dark*. The two
 * combine freely — e.g. dark Explorer or light Dolphin are both valid states.
 *
 * `themeMode` is the persisted user choice ('light' | 'dark' | 'system'). This hook
 * resolves 'system' against the OS preference and applies the result as a single
 * `dark` class on <html>, which is all styles/globals.css needs to swap every
 * `--shell-surface` / `--shell-sidebar` / `--shell-border` variable.
 */
export function useTheme(): { mode: UIThemeMode; setMode: (mode: UIThemeMode) => void } {
  const mode = useAppStore((state) => state.themeMode);
  const setMode = useAppStore((state) => state.setThemeMode);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    function applyResolvedTheme(): void {
      const isDark = mode === 'system' ? media.matches : mode === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
    }

    applyResolvedTheme();

    // Only matters while mode === 'system' — an explicit choice shouldn't move
    // when the OS theme changes, so this listener is harmless but inert otherwise.
    media.addEventListener('change', applyResolvedTheme);
    return () => media.removeEventListener('change', applyResolvedTheme);
  }, [mode]);

  return { mode, setMode };
}
