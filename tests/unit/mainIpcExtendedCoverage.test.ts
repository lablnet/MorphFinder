import { describe, it, expect, vi, beforeEach } from 'vitest';

const ipcHandlersMap = new Map<string, Function>();
const mockWindow = {
  id: 1,
  focus: vi.fn(),
  webContents: { send: vi.fn() },
};

vi.mock('electron', async (importOriginal) => {
  const actual = await importOriginal<typeof import('electron')>();
  return {
    ...actual,
    app: {
      isPackaged: false,
      getAppPath: () => '/app',
      getPath: () => '/home',
      name: 'MorphFinder',
    },
    ipcMain: {
      handle: vi.fn((channel: string, handler: Function) => {
        ipcHandlersMap.set(channel, handler);
      }),
    },
    BrowserWindow: {
      fromWebContents: vi.fn(() => mockWindow),
      getFocusedWindow: vi.fn(() => mockWindow),
      getAllWindows: vi.fn(() => [mockWindow]),
    },
  };
});

describe('Main IPC registerHandlers Coverage', () => {
  beforeEach(() => {
    vi.resetModules();
    ipcHandlersMap.clear();
  });

  it('registers handlers for all IPC contract channels and proxies window correctly', async () => {
    const { registerHandlers, proxyWindow } = await import('../../src/main/ipc/registerHandlers');

    registerHandlers();

    expect(ipcHandlersMap.size).toBeGreaterThan(10);
    expect(ipcHandlersMap.has('fs:readDirectory')).toBe(true);

    // Test proxyWindow access
    expect((proxyWindow as any).id).toBe(1);
    expect(typeof (proxyWindow as any).focus).toBe('function');
    (proxyWindow as any).focus();
    expect(mockWindow.focus).toHaveBeenCalled();

    // Test IPC dispatch with event window sender
    const readDirHandler = ipcHandlersMap.get('fs:readDirectory')!;
    const mockEvent = { sender: {} };
    
    // Dispatch call
    const result = await readDirHandler(mockEvent, { path: process.cwd(), includeHidden: false });
    expect(result).toBeDefined();
  });

  it('rejects malformed IPC payloads at central dispatch before service handlers run', async () => {
    const { registerHandlers } = await import('../../src/main/ipc/registerHandlers');

    registerHandlers();

    const readDirHandler = ipcHandlersMap.get('fs:readDirectory')!;
    expect(() => {
      readDirHandler({ sender: {} }, { path: 'morph://cache-cleaner', includeHidden: false });
    }).toThrow(/filesystem path/);
  });
});
