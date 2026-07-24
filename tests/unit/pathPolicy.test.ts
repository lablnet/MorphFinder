import { describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => (name === 'home' ? '/Users/example' : `/Users/example/${name}`),
  },
}));

describe('filesystem path policy', () => {
  it('rejects virtual paths for filesystem operations', async () => {
    const { assertFilesystemPath } = await import('../../src/main/services/pathPolicy');
    expect(() => assertFilesystemPath('morph://cache-cleaner', 'Read directory')).toThrow(/real filesystem path/);
  });

  it('protects roots and the user home from permanent delete', async () => {
    const { assertSafePermanentDeleteTargets } = await import('../../src/main/services/pathPolicy');
    expect(() => assertSafePermanentDeleteTargets(['/'])).toThrow(/protected path/);
    expect(() => assertSafePermanentDeleteTargets(['/Users/example'])).toThrow(/protected path/);
    expect(() => assertSafePermanentDeleteTargets(['/Users/example/Desktop/file.txt'])).not.toThrow();
  });
});
