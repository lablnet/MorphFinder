import { app, BrowserWindow, nativeImage } from 'electron';
import { applyContentSecurityPolicy } from './security';
import { createMainWindow } from './window/createMainWindow';
import { registerHandlers } from './ipc/registerHandlers';
import { disposeAllWatchers } from './services/watcherService';
import { startAutoUpdater } from './services/updateService';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

app.name = 'MorphFinder';

/** Lifecycle glue only — every behavior lives in services/ and ipc/. */
app.whenReady().then(() => {
  applyContentSecurityPolicy();

  // Set macOS Dock Icon in dev/runtime
  if (process.platform === 'darwin') {
    const iconPath = join(app.getAppPath(), 'build/icon.png');
    if (existsSync(iconPath)) {
      app.dock.setIcon(nativeImage.createFromPath(iconPath));
    }
  }

  const window = createMainWindow();
  registerHandlers(window);
  startAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const reactivatedWindow = createMainWindow();
      registerHandlers(reactivatedWindow);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  void disposeAllWatchers();
});
