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
