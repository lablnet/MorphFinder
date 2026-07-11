import { join } from 'node:path';
import { BrowserWindow, shell, app } from 'electron';
import { existsSync } from 'node:fs';
import { MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH } from '@shared/constants';
import { guardNavigation } from '../security';

/**
 * Frameless-capable chrome on every OS: each Tri-UI shell draws its own title bar
 * region, so we hide the native one but keep the traffic-light / overlay controls
 * electron still needs to render depending on platform.
 */
export function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    show: false,
    backgroundColor: '#00000000',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    ...(process.platform === 'darwin'
      ? { trafficLightPosition: { x: 16, y: 16 } }
      : { titleBarOverlay: { color: '#00000000', symbolColor: '#8a8a8a', height: 36 } }),
    ...(existsSync(join(app.getAppPath(), 'build/icon.png'))
      ? { icon: join(app.getAppPath(), 'build/icon.png') }
      : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  window.on('ready-to-show', () => window.show());

  guardNavigation(window.webContents);
  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  const devServerUrl = process.env.ELECTRON_RENDERER_URL;
  if (devServerUrl !== undefined) {
    void window.loadURL(devServerUrl);
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return window;
}
