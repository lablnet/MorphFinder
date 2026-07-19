import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWellKnownDirs } from '@renderer/hooks/files/useWellKnownDirs';
import { useAppStore } from '@renderer/store';
import { ipc } from '@renderer/services/ipc';

vi.mock('@renderer/services/ipc', () => ({
  ipc: {
    invoke: vi.fn().mockResolvedValue({
      home: '/Users/test',
      desktop: '/Users/test/Desktop',
      documents: '/Users/test/Documents',
      downloads: '/Users/test/Downloads',
    }),
  },
}));

describe('useWellKnownDirs', () => {
  it('fetches well known directories when null in store', async () => {
    useAppStore.setState({ wellKnownDirs: null });

    renderHook(() => useWellKnownDirs());

    expect(ipc.invoke).toHaveBeenCalledWith('fs:wellKnownDirs', undefined);
  });
});
