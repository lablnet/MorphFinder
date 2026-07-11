import type { ShellDefinition } from '../types';
import { FinderChrome } from './FinderChrome';
import { FinderSidebar } from './FinderSidebar';
import { FinderStatusBar } from './FinderStatusBar';

/** macOS reference shell: rounded controls, unified toolbar feel, icon-grid-first. */
export const finderShell: ShellDefinition = {
  id: 'finder',
  label: 'Finder',
  density: 'comfortable',
  defaultViewMode: 'icons',
  tokens: {
    accent: '#2563eb',
    font: "-apple-system, 'SF Pro Text', BlinkMacSystemFont, sans-serif",
    radius: '8px',
    rowHeight: '32px',
  },
  regions: {
    WindowChrome: FinderChrome,
    Sidebar: FinderSidebar,
    StatusBar: FinderStatusBar,
  },
};
