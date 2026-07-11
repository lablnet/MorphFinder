import type { ShellDefinition } from '../types';
import { DolphinChrome } from './DolphinChrome';
import { DolphinSidebar } from './DolphinSidebar';
import { DolphinStatusBar } from './DolphinStatusBar';

/** KDE Dolphin reference shell: places panel, split-friendly toolbar, list-first. */
export const dolphinShell: ShellDefinition = {
  id: 'dolphin',
  label: 'Dolphin',
  density: 'compact',
  defaultViewMode: 'list',
  tokens: {
    accent: '#1d99f3',
    font: "'Noto Sans', 'Cantarell', sans-serif",
    radius: '6px',
    rowHeight: '26px',
  },
  regions: {
    WindowChrome: DolphinChrome,
    Sidebar: DolphinSidebar,
    StatusBar: DolphinStatusBar,
  },
};
