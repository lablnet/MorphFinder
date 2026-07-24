import { Trash2, PieChart, Code2, Sparkles, Copy, Clock3, Wifi } from 'lucide-react';
import { AIRSHARE_PATH, CACHE_CLEANER_PATH, SPACE_ANALYZER_PATH, DEV_PANEL_PATH, SMART_COLLECTIONS_PATH, DUPLICATE_FINDER_PATH, FILE_TIMELINE_PATH } from '@shared/constants';

export const SIDEBAR_TOOLS = [
  {
    label: 'AirShare Hub',
    path: AIRSHARE_PATH,
    icon: Wifi,
  },
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
  {
    label: 'Smart Collections',
    path: SMART_COLLECTIONS_PATH,
    icon: Sparkles,
  },
  {
    label: 'Duplicate Finder',
    path: DUPLICATE_FINDER_PATH,
    icon: Copy,
  },
  {
    label: 'File Timeline',
    path: FILE_TIMELINE_PATH,
    icon: Clock3,
  },
] as const;
