import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getDirectoryAnnotation, setDirectoryAnnotation } from '../../../src/main/services/directoryAnnotationService';

vi.mock('electron', () => ({
  app: {
    getPath: () => tmpdir(),
  },
}));

describe('directoryAnnotationService', () => {
  const testDir = join(tmpdir(), 'morphfinder-annotation-test-' + Date.now());

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('returns default empty annotation when no notes exist', async () => {
    const ann = await getDirectoryAnnotation(testDir);
    expect(ann.path).toBe(testDir);
    expect(ann.notes).toBe('');
    expect(ann.tags).toEqual([]);
  });

  it('saves and reads annotations correctly with typed tags', async () => {
    const updated = await setDirectoryAnnotation({
      path: testDir,
      notes: 'Important folder notes',
      tags: [{ id: 'work-red', label: 'work', color: '#ff0000' }],
    });

    expect(updated.notes).toBe('Important folder notes');
    expect(updated.tags).toEqual([{ id: 'work-red', label: 'work', color: '#ff0000' }]);

    const fetched = await getDirectoryAnnotation(testDir);
    expect(fetched.notes).toBe('Important folder notes');
    expect(fetched.tags).toEqual([{ id: 'work-red', label: 'work', color: '#ff0000' }]);
  });
});
