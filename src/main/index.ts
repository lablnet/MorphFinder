import { app, BrowserWindow } from 'electron';
import { applyContentSecurityPolicy } from './security';
import { createMainWindow } from './window/createMainWindow';
import { registerHandlers } from './ipc/registerHandlers';
import { disposeAllWatchers } from './services/watcherService';
import { startAutoUpdater } from './services/updateService';

/** Lifecycle glue only — every behavior lives in services/ and ipc/. */
app.whenReady().then(() => {
  applyContentSecurityPolicy();

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
