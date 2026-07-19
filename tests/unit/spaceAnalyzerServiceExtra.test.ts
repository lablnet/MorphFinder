/**
 * spaceAnalyzerServiceExtra.test.ts
 * Extra coverage for abortScan, getDiskSpace, and scanDirectorySize.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>();
  return {
    ...actual,
    exec: vi.fn().mockImplementation((cmd, cb) => {
      // Simulate df -k response for unix
      cb(null, '  Filesystem 1K-blocks  Used Available\n/dev/disk1 500000000 200000000 300000000 40% /\n', '');
      return { on: vi.fn() };
    }),
  };
});

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...actual,
    readdir: vi.fn().mockImplementation(async (dirPath) => {
      const p = String(dirPath);
      if (p.includes('empty')) return [];
      return [
        { name: 'file.txt', isDirectory: () => false, isFile: () => true, isSymbolicLink: () => false },
        { name: 'subdir', isDirectory: () => true, isFile: () => false, isSymbolicLink: () => false },
        { name: 'link', isDirectory: () => false, isFile: () => false, isSymbolicLink: () => true },
      ];
    }),
    lstat: vi.fn().mockImplementation(async (path) => {
      const p = String(path);
      if (p.endsWith('link')) {
        return { isDirectory: () => false, isFile: () => false, isSymbolicLink: () => true, size: 0, dev: 1, ino: 999, blocks: 0, mtimeMs: Date.now(), birthtimeMs: Date.now() };
      }
      if (p.endsWith('subdir')) {
        return { isDirectory: () => true, isFile: () => false, isSymbolicLink: () => false, size: 4096, dev: 1, ino: Math.round(Math.random() * 10000), blocks: 8, mtimeMs: Date.now(), birthtimeMs: Date.now() };
      }
      return { isDirectory: () => false, isFile: () => true, isSymbolicLink: () => false, size: 1024, dev: 1, ino: Math.round(Math.random() * 10000), blocks: 2, mtimeMs: Date.now(), birthtimeMs: Date.now() };
    }),
  };
});

import { abortScan, getDiskSpace, scanDirectorySize } from '../../src/main/services/spaceAnalyzerService';

describe('spaceAnalyzerService extra coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('abortScan sets flag and stops scan', async () => {
    abortScan();
    // After abort, next scanDirectorySize should reset the flag
    const result = await scanDirectorySize('/mock/empty');
    expect(result.rootNode).toBeDefined();
  });

  it('getDiskSpace on unix-like platforms', async () => {
    const result = await getDiskSpace('/');
    expect(typeof result.total).toBe('number');
    expect(typeof result.free).toBe('number');
  });

  it('scanDirectorySize scans directory tree', async () => {
    const progressCalls: string[] = [];
    const result = await scanDirectorySize('/mock/dir', (path) => {
      progressCalls.push(path);
    });
    expect(result.rootNode).toBeDefined();
    expect(result.rootNode.isDirectory).toBe(true);
  });

  it('getDiskSpace on win32', async () => {
    const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });

    const result = await getDiskSpace('C:\\Users');
    expect(typeof result.total).toBe('number');

    if (originalPlatform) Object.defineProperty(process, 'platform', originalPlatform);
  });
});
