import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nativeCapabilities, getNativeMetadata, setNativeTags, getSystemLocations } from '../../../src/main/services/nativeBridge';

describe('nativeBridge Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns native capabilities for current platform', () => {
    const caps = nativeCapabilities();
    expect(caps).toHaveProperty('isAvailable');
    expect(caps).toHaveProperty('supportsTags');
    expect(caps).toHaveProperty('supportsThumbnails');
    expect(caps).toHaveProperty('supportsOpenWith');
  });

  it('returns metadata for existing directory/file path without throwing', () => {
    const meta = getNativeMetadata(process.cwd());
    expect(meta).toHaveProperty('tags');
    expect(meta).toHaveProperty('spotlightKind');
  });

  it('handles setNativeTags safely without throwing', () => {
    expect(() => setNativeTags(process.cwd(), [{ name: 'Red', colorIndex: 6 }])).not.toThrow();
  });

  it('returns system locations list', () => {
    const locs = getSystemLocations();
    expect(Array.isArray(locs)).toBe(true);
    expect(locs.length).toBeGreaterThan(0);
    expect(locs[0]).toHaveProperty('path');
  });
});
