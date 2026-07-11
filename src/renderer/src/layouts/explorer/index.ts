import type { ShellDefinition } from '../types';
import { ExplorerChrome } from './ExplorerChrome';
import { ExplorerSidebar } from './ExplorerSidebar';
import { ExplorerStatusBar } from './ExplorerStatusBar';

/** Windows 11 reference shell: sharper corners, command-bar chrome, list-first. */
export const explorerShell: ShellDefinition = {
  id: 'explorer',
  label: 'Explorer',
  density: 'compact',
  defaultViewMode: 'list',
  tokens: {
    accent: '#0078d4',
    font: "'Segoe UI Variable', 'Segoe UI', sans-serif",
    radius: '4px',
    rowHeight: '28px',
  },
  regions: {
    WindowChrome: ExplorerChrome,
    Sidebar: ExplorerSidebar,
    StatusBar: ExplorerStatusBar,
  },
};
