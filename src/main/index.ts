import { app, BrowserWindow, nativeImage, net, protocol } from 'electron';
import { applyContentSecurityPolicy } from './security';
import { createMainWindow } from './window/createMainWindow';
import { registerHandlers } from './ipc/registerHandlers';
import { disposeAllWatchers } from './services/watcherService';
import { startAutoUpdater } from './services/updateService';
import { setupApplicationMenu } from './menu';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
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
  protocol.handle('morph-file', (request) => {
    const url = new URL(request.url);
    // pathname is the file path; on Windows it'll start with /C:/...
    const filePath = decodeURIComponent(url.pathname);
    return net.fetch(pathToFileURL(filePath).href);
  });

  // Set macOS Dock Icon and About Panel in dev/runtime
  if (process.platform === 'darwin') {
    const iconPath = join(app.getAppPath(), 'build/icon.png');
    if (existsSync(iconPath)) {
      app.dock.setIcon(nativeImage.createFromPath(iconPath));
      app.setAboutPanelOptions({
        applicationName: 'MorphFinder',
        applicationVersion: '1.0.0',
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
