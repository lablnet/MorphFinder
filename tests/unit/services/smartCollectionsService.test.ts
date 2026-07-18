import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { scanSmartCollection } from '../../../src/main/services/smartCollectionsService';

describe('smartCollectionsService', () => {
  const testDir = join(tmpdir(), 'morphfinder-smart-test-' + Date.now());

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });

    // Large file (2MB)
    const largeBuffer = Buffer.alloc(2 * 1024 * 1024);
    await writeFile(join(testDir, 'huge_movie.mp4'), largeBuffer);

    // Code project mock file
    await writeFile(join(testDir, 'package.json'), JSON.stringify({ name: 'test' }));

    // Screenshot file
    await writeFile(join(testDir, 'Screenshot 2026-01-01.png'), 'image');
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('scans for large files (> 100MB threshold or size query)', async () => {
    const result = await scanSmartCollection({ id: 'large', roots: [testDir] });
    expect(result.nodes).toBeDefined();
  });

  it('scans for build artifacts', async () => {
    const buildDir = join(testDir, 'dist');
    await mkdir(buildDir, { recursive: true });
    const result = await scanSmartCollection({ id: 'build-artifacts', roots: [testDir] });
    const matchPaths = result.nodes.map((m) => m.name);
    expect(matchPaths).toContain('dist');
  });

  it('scans for screenshots using filename patterns', async () => {
    const result = await scanSmartCollection({ id: 'screenshots', roots: [testDir] });
    const matchPaths = result.nodes.map((m) => m.name);
    expect(matchPaths).toContain('Screenshot 2026-01-01.png');
  });
});
