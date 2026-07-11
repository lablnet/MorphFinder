/** Windows uses backslashes; keeping one basename helper avoids path-lib drift
 *  between main (node:path) and renderer (no node:path access). */
export function basenameOf(fullPath: string): string {
  const normalized = fullPath.replace(/[/\\]+$/, '');
  const segments = normalized.split(/[/\\]/);
  return segments.at(-1) ?? normalized;
}

export const APP_NAME = 'MorphFinder';

export const MIN_WINDOW_WIDTH = 860;
export const MIN_WINDOW_HEIGHT = 560;

export const THIS_PC_PATH = 'morph://this-pc';
export const CACHE_CLEANER_PATH = 'morph://cache-cleaner';
export const SPACE_ANALYZER_PATH = 'morph://space-analyzer';
export const DEV_PANEL_PATH = 'morph://dev-panel';
export const SMART_COLLECTIONS_PATH = 'morph://smart-collections';
export const DUPLICATE_FINDER_PATH = 'morph://duplicate-finder';
export const FILE_TIMELINE_PATH = 'morph://file-timeline';

export function smartCollectionPath(id: string): string {
  return `${SMART_COLLECTIONS_PATH}/${id}`;
}
