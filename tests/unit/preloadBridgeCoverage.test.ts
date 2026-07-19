import { describe, it, expect, vi, beforeEach } from 'vitest';
import Module from 'node:module';

const mockIpcRenderer = {
  invoke: vi.fn().mockResolvedValue({ success: true }),
  on: vi.fn(),
  removeListener: vi.fn(),
};

const mockContextBridge = {
  exposeInMainWorld: vi.fn(),
};

const mockElectron = {
  contextBridge: mockContextBridge,
  ipcRenderer: mockIpcRenderer,
};

// Override Node Module._load so require('electron') returns mockElectron
const originalLoad = (Module as any)._load;
(Module as any)._load = function (request: string, _parent: any, _isMain: boolean) {
  if (request === 'electron') {
    return mockElectron;
  }
  return originalLoad.apply(this, arguments);
};

describe('Preload Bridge Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes window.morph bridge to contextBridge and delegates calls to ipcRenderer', async () => {
    await import('../../src/preload/index');

    expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledWith('morph', expect.anything());

    const bridge = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
    const invokeRes = await bridge.invoke('fs:readDirectory', { path: '/tmp' });
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('fs:readDirectory', { path: '/tmp' });
    expect(invokeRes).toEqual({ success: true });

    const listener = vi.fn();
    let registeredSub: any;
    mockIpcRenderer.on.mockImplementation((channel, sub) => {
      registeredSub = sub;
    });

    const unsubscribe = bridge.on('fs:watcherEvent', listener);
    expect(mockIpcRenderer.on).toHaveBeenCalledWith('fs:watcherEvent', expect.any(Function));

    registeredSub({}, { event: 'change', path: '/tmp/foo' });
    expect(listener).toHaveBeenCalledWith({ event: 'change', path: '/tmp/foo' });

    unsubscribe();
    expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith('fs:watcherEvent', registeredSub);
  });
});
