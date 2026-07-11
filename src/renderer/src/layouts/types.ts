import type { ComponentType, ReactNode } from 'react';
import type { UIShell } from '@shared/types/layout';
import type { WellKnownDirs } from '@renderer/store/fileSystem.slice';

/**
 * Properties that differ *by shell* (Finder vs Explorer vs Dolphin). Colors are
 * deliberately not here — light/dark is a separate axis handled by useTheme via the
 * `:root.dark` overrides in styles/globals.css, so switching shells never fights
 * with switching theme.
 */
export interface ShellTokens {
  accent: string;
  font: string;
  radius: string;
  rowHeight: string;
}

/** Every shell's chrome regions implement the same three slots — ShellLayout composes
 *  them identically regardless of which shell is active. */
export interface ShellRegionProps {
  children?: ReactNode;
}

export interface SidebarProps {
  wellKnownDirs: WellKnownDirs | null;
  activePath: string;
  onNavigate: (path: string) => void;
}

export interface ShellRegions {
  /** Traffic-light-safe top strip on macOS; drag region + window controls elsewhere. */
  WindowChrome: ComponentType<ShellRegionProps>;
  /** Favorites/places list — Finder sidebar, Explorer nav pane, Dolphin places panel.
   *  Shell-specific grouping/labels live here; the navigate callback is the only behavior. */
  Sidebar: ComponentType<SidebarProps>;
  /** Chrome strip only — the page injects its own status text as children. */
  StatusBar: ComponentType<ShellRegionProps>;
}

export interface ShellDefinition {
  id: UIShell;
  label: string;
  tokens: ShellTokens;
  regions: ShellRegions;
  /** Row height / padding hint consumed by the file view components. */
  density: 'compact' | 'comfortable';
  /** Per-shell default view mode, mirrors DEFAULT_VIEW_MODE_BY_SHELL for the registry consumer. */
  defaultViewMode: 'icons' | 'list' | 'columns' | 'gallery';
}
