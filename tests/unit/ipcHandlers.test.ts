import { describe, it, expect, vi } from 'vitest';
import { ipcWindowStore, proxyWindow } from '../../src/main/ipc/registerHandlers';
import type { BrowserWindow } from 'electron';

describe('IPC ProxyWindow & Store', () => {
  it('forwards method calls to active window in ipcWindowStore', () => {
    const mockWindow = {
      id: 42,
      isDestroyed: () => false,
      webContents: {
        send: vi.fn(),
      },
    } as unknown as BrowserWindow;

    ipcWindowStore.run(mockWindow, () => {
      expect((proxyWindow as unknown as { id: number }).id).toBe(42);
      expect(proxyWindow.isDestroyed()).toBe(false);
    });
  });

  it('returns undefined if no active window is available', () => {
    expect((proxyWindow as unknown as { nonExistentProperty: unknown }).nonExistentProperty).toBeUndefined();
  });
});
