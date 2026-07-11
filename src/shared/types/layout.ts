/** Named after the emulated app, not the OS — a fourth skin won't strain the naming. */
export type UIShell = 'finder' | 'explorer' | 'dolphin';

export type UIThemeMode = 'light' | 'dark' | 'system';

export type ViewMode = 'icons' | 'list' | 'columns' | 'gallery';

export const DEFAULT_VIEW_MODE_BY_SHELL: Record<UIShell, ViewMode> = {
  finder: 'icons',
  explorer: 'list',
  dolphin: 'list',
};
