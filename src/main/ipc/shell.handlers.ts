import { app, dialog, type BrowserWindow } from 'electron';
import type { IpcContract } from '@shared/ipc/contract';
import { openPath, showItemInFolder, trashPaths } from '../services/fileSystemService';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

export function createShellHandlers(window: BrowserWindow): {
  'shell:trash': Handler<'shell:trash'>;
  'shell:open': Handler<'shell:open'>;
  'shell:showInFolder': Handler<'shell:showInFolder'>;
  'shell:startDrag': Handler<'shell:startDrag'>;
  'shell:openWith': Handler<'shell:openWith'>;
  'shell:selectFolder': Handler<'shell:selectFolder'>;
} {
  return {
    'shell:trash': ({ paths }) => trashPaths(paths),
    'shell:open': ({ path }) => openPath(path),
    'shell:showInFolder': ({ path }) => Promise.resolve(showItemInFolder(path)),
    'shell:startDrag': async ({ paths }) => {
      const path = paths[0];
      if (path === undefined) return;
      const icon = await app.getFileIcon(path, { size: 'normal' });
      if (window.isDestroyed()) return;
      window.webContents.startDrag(paths.length === 1 ? { file: path, icon } : { file: path, files: paths, icon });
    },
    'shell:openWith': ({ path }) => openPath(path),
    'shell:selectFolder': async ({ defaultPath }) => {
      const options: Electron.OpenDialogOptions = {
        properties: ['openDirectory'],
      };
      if (defaultPath !== undefined) {
        options.defaultPath = defaultPath;
      }
      const result = await dialog.showOpenDialog(window, options);
      if (result.canceled || result.filePaths.length === 0) return null;
      return result.filePaths[0] ?? null;
    },
  };
}
