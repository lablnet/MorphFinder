import { app } from 'electron';
import updater from 'electron-updater';

const { autoUpdater } = updater;

export function startAutoUpdater(): void {
  if (!app.isPackaged || process.mas) return;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.logger = console;
  autoUpdater.on('error', (error) => console.error('Auto-update failed', error));
  void Promise.resolve(autoUpdater.checkForUpdatesAndNotify()).catch(() => {});
}
