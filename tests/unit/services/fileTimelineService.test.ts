import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { scanFileTimeline } from '../../../src/main/services/fileTimelineService';

vi.mock('../../../src/main/services/gitService', () => ({
  getGitStatus: async () => ({
    isRepo: false,
    repoRoot: null,
    statusMap: {},
  }),
}));

describe('fileTimelineService', () => {
  const testDir = join(tmpdir(), 'morphfinder-timeline-test-' + Date.now());

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
    await writeFile(join(testDir, 'recent_file.txt'), 'content');
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('scans timeline files and returns timeline items', async () => {
    const result = await scanFileTimeline({ rootPath: testDir, days: 7, maxItems: 50, includeHidden: false });
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);

    const fileNames = result.items.map((f) => f.name);
    expect(fileNames).toContain('recent_file.txt');
  });
});
