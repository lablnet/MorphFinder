import { describe, it, expect, vi, beforeEach } from 'vitest';

const menuState = vi.hoisted(() => ({
  builtMenu: null as any,
  dockMenu: null as any,
  mockWindow: {
    isMinimized: vi.fn().mockReturnValue(true),
    restore: vi.fn(),
    show: vi.fn(),
    focus: vi.fn(),
    webContents: { send: vi.fn() },
  },
}));

vi.mock('electron', () => {
  function BrowserWindowMock() {}
  BrowserWindowMock.getFocusedWindow = vi.fn(() => menuState.mockWindow);
  BrowserWindowMock.getAllWindows = vi.fn(() => [menuState.mockWindow]);

  Object.setPrototypeOf(menuState.mockWindow, BrowserWindowMock.prototype);

  const mockMenu = {
    buildFromTemplate: vi.fn((template) => ({ template })),
    setApplicationMenu: vi.fn((menu) => {
      menuState.builtMenu = menu;
    }),
  };

  const mockApp = {
    name: 'MorphFinder',
    dock: {
      setMenu: vi.fn((menu) => {
        menuState.dockMenu = menu;
      }),
    },
  };

  const mockShell = {
    openExternal: vi.fn().mockResolvedValue(undefined),
  };

  return {
    app: mockApp,
    Menu: mockMenu,
    BrowserWindow: BrowserWindowMock,
    shell: mockShell,
  };
});

describe('Main Menu Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets up application menu and handles clicks', async () => {
    const { setupApplicationMenu } = await import('../../src/main/menu');
    setupApplicationMenu();

    expect(menuState.builtMenu).toBeDefined();

    // Trigger File -> Go to folder click
    const fileMenu = menuState.builtMenu.template.find((m: any) => m.label === 'File');
    const goToFolderItem = fileMenu.submenu.find((i: any) => i.label === 'Go to Folder...');
    goToFolderItem.click(null, menuState.mockWindow);
    expect(menuState.mockWindow.webContents.send).toHaveBeenCalledWith('command-palette:toggle');

    // Trigger View -> Toggle Command Palette click
    const viewMenu = menuState.builtMenu.template.find((m: any) => m.label === 'View');
    const toggleCmdItem = viewMenu.submenu.find((i: any) => i.label === 'Toggle Command Palette');
    toggleCmdItem.click(null, menuState.mockWindow);

    // Trigger Help -> Learn More click
    const helpMenu = menuState.builtMenu.template.find((m: any) => m.role === 'help');
    const learnMoreItem = helpMenu.submenu.find((i: any) => i.label === 'Learn More');
    await learnMoreItem.click();

    // Trigger dock menu click if platform is darwin
    if (process.platform === 'darwin' && menuState.dockMenu) {
      const dockGoToFolder = menuState.dockMenu.template[0];
      dockGoToFolder.click();
      expect(menuState.mockWindow.restore).toHaveBeenCalled();
      expect(menuState.mockWindow.show).toHaveBeenCalled();
      expect(menuState.mockWindow.focus).toHaveBeenCalled();
    }
  });
});
