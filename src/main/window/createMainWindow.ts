import { join } from 'node:path';
import { BrowserWindow, shell, app } from 'electron';
import { existsSync } from 'node:fs';
import { MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH } from '@shared/constants';
import { guardNavigation } from '../security';

const activeWindows = new Set<BrowserWindow>();

/**
 * Frameless-capable chrome on every OS: each Tri-UI shell draws its own title bar
 * region, so we hide the native one but keep the traffic-light / overlay controls
 * electron still needs to render depending on platform.
 */
export function createMainWindow(initialPath?: string): BrowserWindow {
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
      plugins: true,
    },
  });

  activeWindows.add(window);
  window.on('closed', () => {
    activeWindows.delete(window);
  });

  const showWindow = (): void => {
    if (!window.isDestroyed() && !window.isVisible()) {
      window.show();
      window.focus();
    }
  };

  window.on('ready-to-show', showWindow);
  window.webContents.on('did-finish-load', showWindow);
  window.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('Renderer failed to load:', errorCode, errorDescription);
    showWindow();
  });

  // Guarantee window is shown within 1 second even if ready-to-show is delayed by sandbox
  setTimeout(showWindow, 1000);

  guardNavigation(window.webContents);
  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  const devServerUrl = process.env.ELECTRON_RENDERER_URL;
  const windowId = initialPath ? `win-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` : '';
  
  if (devServerUrl !== undefined) {
    const queryParams = new URLSearchParams();
    if (windowId) queryParams.set('windowId', windowId);
    if (initialPath) queryParams.set('initialPath', initialPath);
    const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
    void window.loadURL(devServerUrl + queryStr);
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'), {
      query: initialPath ? { initialPath, windowId } : {},
    });
  }

  return window;
}
