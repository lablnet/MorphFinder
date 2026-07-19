import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  nativeCapabilities,
  getNativeMetadata,
  setNativeTags,
  getNativeThumbnail,
  getOpenWithApps,
  getSystemLocations,
} from '../../src/main/services/nativeBridge';

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getPath: vi.fn((name) => `/mock/${name}`),
  },
  nativeImage: {
    createFromPath: vi.fn().mockReturnValue({
      isEmpty: () => false,
      resize: () => ({ toDataURL: () => 'data:image/png;base64,mock' }),
    }),
  },
}));

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>();
  return {
    ...actual,
    // Override AFTER spread so our stub wins over the real execFileSync
    execFileSync: vi.fn().mockImplementation((cmd: string) => {
      if (cmd === 'powershell.exe') return '{"kind":"Document","comment":"Test"}';
      if (cmd === 'xdg-mime') return 'text/plain';
      if (cmd === 'file') return 'text/plain';
      if (cmd === 'gio') return '';
      return '';
    }),
  };
});

describe('nativeBridge Platform Fallbacks Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tests win32 capabilities and metadata', () => {
    const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });

    const caps = nativeCapabilities();
    expect(caps.supportsThumbnails).toBe(true);

    const meta = getNativeMetadata(process.cwd());
    expect(meta).toBeDefined();

    const apps = getOpenWithApps(process.cwd());
    expect(Array.isArray(apps)).toBe(true);

    if (originalPlatform) Object.defineProperty(process, 'platform', originalPlatform);
  }, 15000);

  it('tests linux capabilities and metadata', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'linux' });

    const caps = nativeCapabilities();
    expect(caps.isAvailable).toBe(true);

    const meta = getNativeMetadata(process.cwd());
    expect(meta).toBeDefined();

    const apps = getOpenWithApps(process.cwd());
    expect(Array.isArray(apps)).toBe(true);

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('tests fallback platform (freebsd)', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'freebsd' });

    const caps = nativeCapabilities();
    expect(caps.isAvailable).toBe(false);

    const meta = getNativeMetadata(process.cwd());
    expect(meta).toBeDefined();

    const apps = getOpenWithApps(process.cwd());
    expect(apps).toBeDefined();

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('tests thumbnails and tags', () => {
    setNativeTags(process.cwd(), [{ name: 'Red', colorIndex: 1 }]);
    const thumb = getNativeThumbnail(process.cwd(), 64, 64, 1);
    expect(thumb).toBeDefined();

    const locations = getSystemLocations();
    expect(locations.length).toBeGreaterThan(0);
  });
});
