import { describe, expect, it } from 'vitest';
import { cleanCaches } from '../../../src/main/services/cacheCleanerService';

describe('cacheCleanerService', () => {
  it('returns appropriate response when platform is non-darwin or targets empty', async () => {
    const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    Object.defineProperty(process, 'platform', { value: 'win32' });

    const cleanResult = await cleanCaches(['target-1']);
    expect(cleanResult.success).toBe(false);

    if (originalPlatform) {
      Object.defineProperty(process, 'platform', originalPlatform);
    }
  });
});
