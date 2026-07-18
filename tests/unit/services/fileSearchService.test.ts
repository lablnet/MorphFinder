import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { searchFiles } from '../../../src/main/services/fileSearchService';

describe('fileSearchService', () => {
  const testDir = join(tmpdir(), 'morphfinder-search-test-' + Date.now());

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
    await writeFile(join(testDir, 'apple.txt'), 'hello world');
    await writeFile(join(testDir, 'application.log'), 'logs');
    await writeFile(join(testDir, 'pineapple.png'), 'image');
    await writeFile(join(testDir, '.hidden_doc'), 'secret');

    const subDir = join(testDir, 'subfolder');
    await mkdir(subDir, { recursive: true });
    await writeFile(join(subDir, 'apple_pie.txt'), 'pie recipe');
    await writeFile(join(subDir, 'banana.txt'), 'yellow fruit');
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('returns empty matches when query string length is less than 2 characters', async () => {
    const result = await searchFiles({ rootPath: testDir, query: 'a' });
    expect(result.matches).toHaveLength(0);
    expect(result.scannedCount).toBe(0);
  });

  it('finds exact, prefix, and substring matches correctly', async () => {
    const result = await searchFiles({ rootPath: testDir, query: 'apple' });
    const matchNames = result.matches.map((m) => m.name);
    expect(matchNames).toContain('apple.txt');
    expect(matchNames).toContain('pineapple.png');
    expect(matchNames).toContain('apple_pie.txt');
  });

  it('scores exact and prefix matches higher than substring matches', async () => {
    const result = await searchFiles({ rootPath: testDir, query: 'apple' });
    expect(result.matches[0].name).toBe('apple.txt');
    expect(result.matches[1].name).toBe('apple_pie.txt');
    expect(result.matches[2].name).toBe('pineapple.png');
  });

  it('excludes hidden files by default when includeHidden is false', async () => {
    const result = await searchFiles({ rootPath: testDir, query: 'hidden', includeHidden: false });
    expect(result.matches).toHaveLength(0);
  });

  it('includes hidden files when includeHidden is true', async () => {
    const result = await searchFiles({ rootPath: testDir, query: 'hidden', includeHidden: true });
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].name).toBe('.hidden_doc');
  });

  it('respects maxResults limit', async () => {
    const result = await searchFiles({ rootPath: testDir, query: 'a', maxResults: 1 });
    expect(result.matches.length).toBeLessThanOrEqual(1);
  });

  it('respects maxDepth limit', async () => {
    const result = await searchFiles({ rootPath: testDir, query: 'pie', maxDepth: 0 });
    expect(result.matches).toHaveLength(0);
  });
});
