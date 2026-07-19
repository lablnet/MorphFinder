/**
 * smartCollectionsExtra.test.ts
 * Additional tests to cover scanSmartCollection branches.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...actual,
    readdir: vi.fn().mockImplementation(async (dirPath) => {
      const p = String(dirPath);
      // Return one small file entry for root dirs
      if (p.includes('mock')) return ['file.txt'];
      return [];
    }),
    lstat: vi.fn().mockImplementation(async (path) => {
      const p = String(path);
      if (p.endsWith('.txt') || p.endsWith('file.txt')) {
        return {
          isDirectory: () => false,
          isFile: () => true,
          isSymbolicLink: () => false,
          size: 50 * 1024 * 1024,  // 50MB - "large" file
          mtimeMs: Date.now() - 1000,  // recent
          birthtimeMs: Date.now() - 2000,
          dev: 1,
          ino: Math.random() * 10000,
          blocks: 100,
        };
      }
      return {
        isDirectory: () => true,
        isFile: () => false,
        isSymbolicLink: () => false,
        size: 4096,
        mtimeMs: Date.now() - 1000,
        birthtimeMs: Date.now() - 2000,
        dev: 1,
        ino: Math.random() * 10000,
        blocks: 8,
      };
    }),
  };
});

vi.mock('../../src/main/services/directoryAnnotationService', () => ({
  listDirectoryAnnotations: vi.fn().mockResolvedValue([
    { path: '/mock/annotated-dir', tags: ['tag1'], notes: 'some notes' },
    { path: '/mock/empty-annotation', tags: [], notes: '' },
  ]),
}));

import { scanSmartCollection } from '../../src/main/services/smartCollectionsService';

describe('smartCollectionsService extended coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('scans "recent" collection', async () => {
    const result = await scanSmartCollection({
      id: 'recent',
      roots: ['/mock/dir'],
      includeHidden: false,
    });
    expect(result.id).toBe('recent');
    expect(Array.isArray(result.nodes)).toBe(true);
  });

  it('scans "large" collection', async () => {
    const result = await scanSmartCollection({
      id: 'large',
      roots: ['/mock/dir'],
      includeHidden: false,
    });
    expect(result.id).toBe('large');
  });

  it('scans "screenshots" collection', async () => {
    const result = await scanSmartCollection({
      id: 'screenshots',
      roots: ['/mock/dir'],
      includeHidden: false,
    });
    expect(result.id).toBe('screenshots');
  });

  it('scans "old-downloads" collection', async () => {
    const result = await scanSmartCollection({
      id: 'old-downloads',
      roots: ['/mock/dir'],
      includeHidden: false,
    });
    expect(result.id).toBe('old-downloads');
  });

  it('scans "build-artifacts" collection', async () => {
    const result = await scanSmartCollection({
      id: 'build-artifacts',
      roots: ['/mock/dir'],
      includeHidden: false,
    });
    expect(result.id).toBe('build-artifacts');
  });

  it('scans "duplicates" collection', async () => {
    const result = await scanSmartCollection({
      id: 'duplicates',
      roots: ['/mock/dir'],
      includeHidden: false,
    });
    expect(result.id).toBe('duplicates');
  });

  it('scans "empty-folders" collection', async () => {
    const result = await scanSmartCollection({
      id: 'empty-folders',
      roots: ['/mock/dir'],
      includeHidden: false,
    });
    expect(result.id).toBe('empty-folders');
  });

  it('scans "annotated" collection', async () => {
    const result = await scanSmartCollection({
      id: 'annotated',
      roots: ['/mock/dir'],
      includeHidden: false,
    });
    expect(result.id).toBe('annotated');
  });
});
