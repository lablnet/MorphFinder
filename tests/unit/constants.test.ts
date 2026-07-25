import { describe, expect, it } from 'vitest';
import {
  APP_NAME,
  CACHE_CLEANER_PATH,
  DEV_PANEL_PATH,
  DUPLICATE_FINDER_PATH,
  FILE_TIMELINE_PATH,
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  SMART_COLLECTIONS_PATH,
  SPACE_ANALYZER_PATH,
  THIS_PC_PATH,
  basenameOf,
  smartCollectionPath,
} from '../../src/shared/constants';

describe('shared constants', () => {
  it('normalizes basenames across Unix and Windows-like paths', () => {
    expect(basenameOf('/')).toBe('Macintosh HD');
    expect(basenameOf('/Users/alex/Documents/')).toBe('Documents');
    expect(basenameOf('C:\\Users\\alex\\Desktop\\file.txt')).toBe('file.txt');
    expect(basenameOf('relative')).toBe('relative');
  });

  it('exposes stable app route constants', () => {
    expect(APP_NAME).toBe('MorphFinder');
    expect(MIN_WINDOW_WIDTH).toBe(860);
    expect(MIN_WINDOW_HEIGHT).toBe(560);
    expect(THIS_PC_PATH).toBe('morph://this-pc');
    expect(CACHE_CLEANER_PATH).toBe('morph://cache-cleaner');
    expect(SPACE_ANALYZER_PATH).toBe('morph://space-analyzer');
    expect(DEV_PANEL_PATH).toBe('morph://dev-panel');
    expect(SMART_COLLECTIONS_PATH).toBe('morph://smart-collections');
    expect(DUPLICATE_FINDER_PATH).toBe('morph://duplicate-finder');
    expect(FILE_TIMELINE_PATH).toBe('morph://file-timeline');
    expect(smartCollectionPath('recent')).toBe('morph://smart-collections/recent');
  });
});
