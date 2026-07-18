import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { scanDuplicates, cancelDuplicateScan } from '../../../src/main/services/duplicateFinderService';

describe('duplicateFinderService', () => {
  const testDir = join(tmpdir(), 'morphfinder-dup-test-' + Date.now());

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
    // Content large enough to pass default minSizeBytes filter (1024 bytes)
    const contentA = 'A'.repeat(2048);
    const contentB = 'B'.repeat(2048);

    await writeFile(join(testDir, 'file1.dat'), contentA);
    await writeFile(join(testDir, 'file2_dup.dat'), contentA);
    await writeFile(join(testDir, 'unique.dat'), contentB);
    await writeFile(join(testDir, 'small.dat'), 'too small');
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('detects duplicate files with identical size and hash', async () => {
    const result = await scanDuplicates({ roots: [testDir], minSizeBytes: 1024 });
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].files).toHaveLength(2);

    const fileNames = result.groups[0].files.map((f) => f.name);
    expect(fileNames).toContain('file1.dat');
    expect(fileNames).toContain('file2_dup.dat');
  });

  it('filters out files smaller than minSizeBytes', async () => {
    const smallContent = 'S'.repeat(500);
    await writeFile(join(testDir, 'small1.dat'), smallContent);
    await writeFile(join(testDir, 'small2.dat'), smallContent);

    const result = await scanDuplicates({ roots: [testDir], minSizeBytes: 1024 });
    const allHashedNames = result.groups.flatMap((g) => g.files.map((f) => f.name));
    expect(allHashedNames).not.toContain('small1.dat');
    expect(allHashedNames).not.toContain('small2.dat');
  });

  it('emits progress callbacks during scan', async () => {
    const progressLog: Array<string> = [];
    await scanDuplicates({ roots: [testDir], minSizeBytes: 1024 }, (p) => {
      progressLog.push(p.phase);
    });

    expect(progressLog.length).toBeGreaterThan(0);
    expect(progressLog).toContain('scanning');
    expect(progressLog).toContain('hashing');
  });

  it('handles cancellation gracefully', async () => {
    const scanPromise = scanDuplicates({ roots: [testDir], minSizeBytes: 1024 });
    cancelDuplicateScan();
    const result = await scanPromise;
    expect(result).toBeDefined();
  });
});
