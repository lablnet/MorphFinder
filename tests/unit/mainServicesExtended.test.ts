import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanCaches, scanCaches } from '../../src/main/services/cacheCleanerService';
import { scanDuplicates } from '../../src/main/services/duplicateFinderService';
import { scanSmartCollection } from '../../src/main/services/smartCollectionsService';

describe('Main Services Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cleans cache targets on unsupported platform', async () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'win32' });

    const scanRes = await scanCaches();
    expect(scanRes.isSupported).toBe(false);

    const cleanRes = await cleanCaches(['target1']);
    expect(cleanRes.success).toBe(false);

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('scans duplicates and streams progress', async () => {
    const onProgress = vi.fn();
    const result = await scanDuplicates({ roots: [process.cwd()] }, onProgress);
    expect(result).toHaveProperty('groups');
  });

  it('scans smart collections', async () => {
    const scanRes = await scanSmartCollection({ id: 'recent', roots: [process.cwd()], includeHidden: false });
    expect(scanRes).toHaveProperty('nodes');
  });
});
