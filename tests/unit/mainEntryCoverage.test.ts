import { describe, it, expect, vi, beforeEach } from 'vitest';

const mainState = vi.hoisted(() => ({
  appHandlers: new Map<string, Function>(),
  protocolSchemes: [] as any[],
  protocolHandlers: new Map<string, Function>(),
  dockIcon: null as any,
  aboutPanel: null as any,
  windowCount: 0,
}));

vi.mock('electron', () => {
  const mockApp = {
    name: '',
    getAppPath: vi.fn(() => '/mock/app'),
    whenReady: vi.fn().mockResolvedValue(undefined),
    on: vi.fn((event: string, handler: Function) => {
      mainState.appHandlers.set(event, handler);
    }),
    dock: {
      setIcon: vi.fn((icon) => { mainState.dockIcon = icon; }),
    },
    setAboutPanelOptions: vi.fn((opts) => { mainState.aboutPanel = opts; }),
    quit: vi.fn(),
  };

  const mockProtocol = {
    registerSchemesAsPrivileged: vi.fn((schemes) => {
      mainState.protocolSchemes.push(...schemes);
    }),
    handle: vi.fn((scheme, handler) => {
      mainState.protocolHandlers.set(scheme, handler);
    }),
  };

  const mockBrowserWindow = {
    getAllWindows: vi.fn(() => Array(mainState.windowCount).fill({})),
  };

  const mockNativeImage = {
    createFromPath: vi.fn((p) => ({ path: p })),
  };

  const mockNet = {
    fetch: vi.fn().mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: new Map([['content-type', 'image/png']]),
      body: 'mock-stream',
    }),
  };

  return {
    app: mockApp,
    protocol: mockProtocol,
    BrowserWindow: mockBrowserWindow,
    nativeImage: mockNativeImage,
    net: mockNet,
  };
});

vi.mock('../../src/main/security', () => ({
  applyContentSecurityPolicy: vi.fn(),
  isSafeMorphFilePath: vi.fn().mockReturnValue(true),
}));

vi.mock('../../src/main/window/createMainWindow', () => ({
  createMainWindow: vi.fn(() => ({})),
}));

vi.mock('../../src/main/ipc/registerHandlers', () => ({
  registerHandlers: vi.fn(),
}));

vi.mock('../../src/main/services/watcherService', () => ({
  disposeAllWatchers: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/main/services/updateService', () => ({
  startAutoUpdater: vi.fn(),
}));

vi.mock('../../src/main/menu', () => ({
  setupApplicationMenu: vi.fn(),
}));

vi.mock('node:fs', () => {
  const fsMock = {
    existsSync: vi.fn().mockReturnValue(true),
    realpathSync: vi.fn((p: string) => p),
  };
  return {
    ...fsMock,
    default: fsMock,
  };
});

describe('Main process index.ts coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mainState.appHandlers.clear();
    mainState.protocolSchemes.length = 0;
    mainState.protocolHandlers.clear();
    mainState.windowCount = 0;
  });

  it('initializes app, registers custom protocol, and handles whenReady lifecycle', async () => {
    await import('../../src/main/index');

    expect(mainState.protocolSchemes.length).toBeGreaterThan(0);

    const handler = mainState.protocolHandlers.get('morph-file');
    expect(handler).toBeDefined();

    // Test valid request
    const validReq = { url: `morph-file://host${encodeURIComponent(process.cwd())}/package.json` };
    const res = await handler!(validReq);

    // Test activate event
    const activateHandler = mainState.appHandlers.get('activate');
    if (activateHandler) activateHandler();

    // Test window-all-closed event
    const windowClosedHandler = mainState.appHandlers.get('window-all-closed');
    if (windowClosedHandler) windowClosedHandler();

    // Test before-quit event
    const beforeQuitHandler = mainState.appHandlers.get('before-quit');
    if (beforeQuitHandler) beforeQuitHandler();
  });
});
