import { describe, expect, it, vi } from 'vitest';
import { ipc } from '../../src/renderer/src/services/ipc';

describe('renderer ipc service', () => {
  it('forwards invoke calls to the context bridge', async () => {
    const invoke = vi.fn(async () => ({ entries: [] }));
    Object.defineProperty(window, 'morph', {
      value: { invoke, on: vi.fn() },
      configurable: true,
    });

    await expect(ipc.invoke('fs:readDirectory', { path: '/tmp' })).resolves.toEqual({ entries: [] });
    expect(invoke).toHaveBeenCalledWith('fs:readDirectory', { path: '/tmp' });
  });

  it('forwards event listeners and returns unsubscribe handlers', () => {
    const unsubscribe = vi.fn();
    const on = vi.fn(() => unsubscribe);
    Object.defineProperty(window, 'morph', {
      value: { invoke: vi.fn(), on },
      configurable: true,
    });
    const listener = vi.fn();

    expect(ipc.on('archive:progress', listener)).toBe(unsubscribe);
    expect(on).toHaveBeenCalledWith('archive:progress', listener);
  });
});
