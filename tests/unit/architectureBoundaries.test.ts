import { describe, expect, it } from 'vitest';
import {
  isVirtualPath,
  isWatchablePath,
  normalizeVirtualPath,
  smartCollectionIdFromPath,
  smartCollectionLocationPath,
  VIRTUAL_LOCATIONS,
} from '../../src/shared/virtualLocations';
import { CACHE_CLEANER_PATH, DUPLICATE_FINDER_PATH, SMART_COLLECTIONS_PATH } from '../../src/shared/constants';
import { validateIpcRequest } from '../../src/main/ipc/validation';

describe('virtual location registry', () => {
  it('recognizes app-owned virtual locations and smart collection paths', () => {
    expect(VIRTUAL_LOCATIONS.length).toBeGreaterThanOrEqual(8);
    expect(isVirtualPath(CACHE_CLEANER_PATH)).toBe(true);
    expect(isVirtualPath(`${SMART_COLLECTIONS_PATH}/recent`)).toBe(true);
    expect(isWatchablePath(CACHE_CLEANER_PATH)).toBe(false);
    expect(isWatchablePath('/Users/example')).toBe(true);
  });

  it('normalizes malformed virtual paths and resolves smart collection ids', () => {
    expect(normalizeVirtualPath('/morph:/cache-cleaner')).toBe(CACHE_CLEANER_PATH);
    expect(smartCollectionIdFromPath(`${SMART_COLLECTIONS_PATH}/recent`)).toBe('recent');
    expect(smartCollectionLocationPath('duplicates')).toBe(DUPLICATE_FINDER_PATH);
  });
});

describe('IPC runtime validation', () => {
  it('accepts valid payloads for dangerous filesystem channels', () => {
    expect(() => validateIpcRequest('shell:deletePermanently', { paths: ['/tmp/a'] })).not.toThrow();
    expect(() => validateIpcRequest('terminal:resize', { id: 'term-1', cols: 80, rows: 24 })).not.toThrow();
  });

  it('rejects virtual paths and malformed payloads before handlers run', () => {
    expect(() => validateIpcRequest('fs:readDirectory', { path: CACHE_CLEANER_PATH, includeHidden: false })).toThrow(/filesystem path/);
    expect(() => validateIpcRequest('shell:deletePermanently', { paths: [] })).toThrow(/non-empty string array/);
    expect(() => validateIpcRequest('terminal:resize', { id: 'term-1', cols: 0, rows: 24 })).toThrow(/positive number/);
  });
});
