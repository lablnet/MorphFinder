import { app, dialog, type BrowserWindow } from 'electron';
import type { IpcContract } from '@shared/ipc/contract';
import { deletePermanently, emptyTrash, openPath, restoreFromTrash, showItemInFolder, trashPaths } from '../services/fileSystemService';

import { createMainWindow } from '../window/createMainWindow';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

export function createShellHandlers(window: BrowserWindow): {
  'shell:trash': Handler<'shell:trash'>;
  'shell:deletePermanently': Handler<'shell:deletePermanently'>;
  'shell:emptyTrash': Handler<'shell:emptyTrash'>;
  'shell:restoreFromTrash': Handler<'shell:restoreFromTrash'>;
  'shell:open': Handler<'shell:open'>;
  'shell:newWindow': Handler<'shell:newWindow'>;
  'shell:showInFolder': Handler<'shell:showInFolder'>;
  'shell:startDrag': Handler<'shell:startDrag'>;
  'shell:openWith': Handler<'shell:openWith'>;
  'shell:selectFolder': Handler<'shell:selectFolder'>;
} {
  return {
    'shell:trash': ({ paths }) => trashPaths(paths),
    'shell:deletePermanently': ({ paths }) => deletePermanently(paths),
    'shell:emptyTrash': () => emptyTrash(),
    'shell:restoreFromTrash': ({ paths }) => restoreFromTrash(paths),
    'shell:open': ({ path }) => openPath(path),
    'shell:newWindow': ({ path }) => {
      console.log('[main] shell:newWindow handler invoked for path:', path);
      try {
        createMainWindow(path);
        console.log('[main] createMainWindow executed successfully');
      } catch (error) {
        console.error('[main] Failed to create new window:', error);
      }
    },
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
