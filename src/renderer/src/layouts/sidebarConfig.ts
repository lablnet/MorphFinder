import { Trash2, PieChart, Code2 } from 'lucide-react';
import { CACHE_CLEANER_PATH, SPACE_ANALYZER_PATH, DEV_PANEL_PATH } from '@shared/constants';

export const SIDEBAR_TOOLS = [
  {
    label: 'Cache Cleaner',
    path: CACHE_CLEANER_PATH,
    icon: Trash2,
  },
  {
    label: 'Space Analyzer',
    path: SPACE_ANALYZER_PATH,
    icon: PieChart,
  },
  {
    label: 'Dev Panel',
    path: DEV_PANEL_PATH,
    icon: Code2,
  },
] as const;
