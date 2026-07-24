import {
  AIRSHARE_PATH,
  CACHE_CLEANER_PATH,
  DEV_PANEL_PATH,
  DUPLICATE_FINDER_PATH,
  FILE_TIMELINE_PATH,
  SMART_COLLECTIONS_PATH,
  SPACE_ANALYZER_PATH,
  THIS_PC_PATH,
  smartCollectionPath,
} from './constants';
import { SMART_COLLECTIONS, type SmartCollectionId } from './types/smartCollections';

export type VirtualLocationId =
  | 'this-pc'
  | 'airshare'
  | 'cache-cleaner'
  | 'space-analyzer'
  | 'dev-panel'
  | 'smart-collections'
  | 'duplicate-finder'
  | 'file-timeline';

export interface VirtualLocationDefinition {
  id: VirtualLocationId;
  path: string;
  label: string;
  commandLabel: string;
  icon: string;
  watchable: boolean;
}

export const VIRTUAL_LOCATIONS: readonly VirtualLocationDefinition[] = [
  {
    id: 'this-pc',
    path: THIS_PC_PATH,
    label: 'This PC',
    commandLabel: 'Open This PC',
    icon: 'Monitor',
    watchable: false,
  },
  {
    id: 'airshare',
    path: AIRSHARE_PATH,
    label: 'Morph AirShare',
    commandLabel: 'Open Morph AirShare (File Exchange Hub)',
    icon: 'Wifi',
    watchable: false,
  },
  {
    id: 'cache-cleaner',
    path: CACHE_CLEANER_PATH,
    label: 'Cache Cleaner',
    commandLabel: 'Open Cache Cleaner',
    icon: 'Trash2',
    watchable: false,
  },
  {
    id: 'space-analyzer',
    path: SPACE_ANALYZER_PATH,
    label: 'Space Analyzer',
    commandLabel: 'Open Space Analyzer',
    icon: 'PieChart',
    watchable: false,
  },
  {
    id: 'dev-panel',
    path: DEV_PANEL_PATH,
    label: 'Dev Panel',
    commandLabel: 'Open Dev Panel',
    icon: 'Code2',
    watchable: false,
  },
  {
    id: 'smart-collections',
    path: SMART_COLLECTIONS_PATH,
    label: 'Smart Collections',
    commandLabel: 'Open Smart Collections',
    icon: 'Sparkles',
    watchable: false,
  },
  {
    id: 'duplicate-finder',
    path: DUPLICATE_FINDER_PATH,
    label: 'Duplicate Finder',
    commandLabel: 'Open Duplicate Finder',
    icon: 'Copy',
    watchable: false,
  },
  {
    id: 'file-timeline',
    path: FILE_TIMELINE_PATH,
    label: 'File Timeline',
    commandLabel: 'Open File Timeline',
    icon: 'Clock3',
    watchable: false,
  },
];

const VIRTUAL_LOCATION_PATHS = new Set(VIRTUAL_LOCATIONS.map((location) => location.path));

export function normalizeVirtualPath(path: string): string {
  if (path.startsWith('/morph:/')) return path.replace('/morph:/', 'morph://');
  return path;
}

export function smartCollectionIdFromPath(path: string): SmartCollectionId | null {
  if (!path.startsWith(`${SMART_COLLECTIONS_PATH}/`)) return null;
  const id = path.slice(SMART_COLLECTIONS_PATH.length + 1);
  return SMART_COLLECTIONS.some((collection) => collection.id === id) ? id as SmartCollectionId : null;
}

export function isSmartCollectionPath(path: string): boolean {
  return path === SMART_COLLECTIONS_PATH || smartCollectionIdFromPath(path) !== null;
}

export function isVirtualPath(path: string): boolean {
  return VIRTUAL_LOCATION_PATHS.has(path) || isSmartCollectionPath(path);
}

export function isWatchablePath(path: string): boolean {
  return !isVirtualPath(path);
}

export function smartCollectionLocationPath(id: SmartCollectionId): string {
  return id === 'duplicates' ? DUPLICATE_FINDER_PATH : smartCollectionPath(id);
}
