import { app, BrowserWindow, nativeImage, net, protocol } from 'electron';
import { applyContentSecurityPolicy, isSafeMorphFilePath } from './security';
import { createMainWindow } from './window/createMainWindow';
import { registerHandlers } from './ipc/registerHandlers';
import { disposeAllWatchers } from './services/watcherService';
import { startAutoUpdater } from './services/updateService';
import { setupApplicationMenu } from './menu';
import { join, normalize, isAbsolute } from 'node:path';
import { existsSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

app.name = 'MorphFinder';

// Register custom scheme *before* app ready — required by Chromium.
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'morph-file',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: false,
    },
  },
]);

/** Lifecycle glue only — every behavior lives in services/ and ipc/. */
app.whenReady().then(() => {
  applyContentSecurityPolicy();
  setupApplicationMenu();

  // Register morph-file:// protocol handler for serving local files to the renderer.
  // URL format: morph-file://host/<absolute-path>
  protocol.handle('morph-file', async (request) => {
    try {
      const url = new URL(request.url);
      // pathname is the file path; on Windows it'll start with /C:/...
      const decodedPath = decodeURIComponent(url.pathname);
      const normalizedPath = normalize(decodedPath);
      if (!isAbsolute(normalizedPath) || !existsSync(normalizedPath) || !isSafeMorphFilePath(normalizedPath)) {
        return new Response('Forbidden', { status: 403 });
      }
      const realPath = realpathSync(normalizedPath);
      if (!isSafeMorphFilePath(realPath)) {
        return new Response('Forbidden', { status: 403 });
      }
      const response = await net.fetch(pathToFileURL(realPath).href);
      const headers = new Headers(response.headers);
      headers.set('X-Content-Type-Options', 'nosniff');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch {
      return new Response('Bad Request', { status: 400 });
    }
  });


  // Set macOS Dock Icon and About Panel in dev/runtime
  if (process.platform === 'darwin') {
    const iconPath = join(app.getAppPath(), 'build/icon.png');
    if (existsSync(iconPath)) {
      app.dock.setIcon(nativeImage.createFromPath(iconPath));
      app.setAboutPanelOptions({
        applicationName: 'MorphFinder',
        applicationVersion: '1.0.0',
        version: '1',
        iconPath: iconPath,
        copyright: 'Copyright © lablnet',
      });
    }
  }

  createMainWindow();
  registerHandlers();
  startAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  void disposeAllWatchers();
});
