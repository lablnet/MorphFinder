import { beforeEach, describe, expect, it, vi } from 'vitest';

const updaterMock = vi.hoisted(() => ({
  isPackaged: false,
  autoUpdater: {
    autoDownload: false,
    autoInstallOnAppQuit: false,
    logger: undefined as unknown,
    on: vi.fn(),
    checkForUpdatesAndNotify: vi.fn(),
  },
}));

vi.mock('electron', () => ({
  app: {
    get isPackaged() {
      return updaterMock.isPackaged;
    },
  },
}));

vi.mock('electron-updater', () => ({
  default: {
    autoUpdater: updaterMock.autoUpdater,
  },
}));

describe('updateService', () => {
  beforeEach(() => {
    updaterMock.isPackaged = false;
    updaterMock.autoUpdater.autoDownload = false;
    updaterMock.autoUpdater.autoInstallOnAppQuit = false;
    updaterMock.autoUpdater.logger = undefined;
    updaterMock.autoUpdater.on.mockClear();
    updaterMock.autoUpdater.checkForUpdatesAndNotify.mockClear();
  });

  it('does nothing when running unpackaged', async () => {
    const { startAutoUpdater } = await import('../../../src/main/services/updateService');

    startAutoUpdater();

    expect(updaterMock.autoUpdater.checkForUpdatesAndNotify).not.toHaveBeenCalled();
  });

  it('configures and starts electron updater when packaged', async () => {
    updaterMock.isPackaged = true;
    const { startAutoUpdater } = await import('../../../src/main/services/updateService');

    startAutoUpdater();

    expect(updaterMock.autoUpdater.autoDownload).toBe(true);
    expect(updaterMock.autoUpdater.autoInstallOnAppQuit).toBe(true);
    expect(updaterMock.autoUpdater.logger).toBe(console);
    expect(updaterMock.autoUpdater.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(updaterMock.autoUpdater.checkForUpdatesAndNotify).toHaveBeenCalledTimes(1);
  });
});
