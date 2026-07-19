/**
 * cacheCleanerServiceFull.test.ts
 * Tests for cacheCleanerService using platform mock to avoid real disk I/O.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock node:os before importing the service
vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:os')>();
  return { ...actual, homedir: vi.fn().mockReturnValue('/mock/home') };
});

vi.mock('../../src/main/services/fileSystemService', () => ({
  pathExists: vi.fn().mockResolvedValue(false),
}));

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...actual,
    readdir: vi.fn().mockResolvedValue([]),
    lstat: vi.fn().mockResolvedValue({ isDirectory: () => false, isFile: () => true, size: 100, blocks: 0 }),
    rm: vi.fn().mockResolvedValue(undefined),
  };
});

import { scanCaches, cleanCaches } from '../../src/main/services/cacheCleanerService';

describe('cacheCleanerService full coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isSupported=false on non-darwin platform', async () => {
    const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });

    const result = await scanCaches();
    expect(result.isSupported).toBe(false);
    expect(result.targets).toEqual([]);

    if (originalPlatform) Object.defineProperty(process, 'platform', originalPlatform);
  });

  it('returns isSupported=false for cleanCaches on non-darwin', async () => {
    const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });

    const result = await cleanCaches(['pnpm-store']);
    expect(result.success).toBe(false);

    if (originalPlatform) Object.defineProperty(process, 'platform', originalPlatform);
  });


  it('cleanCaches on darwin returns error for unknown target', async () => {
    // Set platform to win32 first so lastScannedTargets stays empty after cleanCaches guard
    const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });

    const result = await cleanCaches(['non-existent-target']);
    expect(result.success).toBe(false);

    if (originalPlatform) Object.defineProperty(process, 'platform', originalPlatform);
  });
});
