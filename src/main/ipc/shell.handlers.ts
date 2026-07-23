import { dirname } from 'node:path';
import { stat } from 'node:fs/promises';
import { app, dialog, type BrowserWindow } from 'electron';
import type { IpcContract } from '@shared/ipc/contract';
import { deletePermanently, emptyTrash, openPath, restoreFromTrash, showItemInFolder, trashPaths } from '../services/fileSystemService';

import { createMainWindow } from '../window/createMainWindow';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

const securityScopedAccess = new Map<string, () => void>();

async function normalizeDialogDefaultPath(defaultPath?: string): Promise<string | undefined> {
  if (defaultPath === undefined || defaultPath.startsWith('morph://')) return undefined;

  try {
    const stats = await stat(defaultPath);
    return stats.isDirectory() ? defaultPath : dirname(defaultPath);
  } catch {
    return undefined;
  }
}

function retainSecurityScopedAccess(path: string, bookmark?: string): void {
  if (bookmark === undefined || process.platform !== 'darwin') return;

  try {
    securityScopedAccess.get(path)?.();
    const stopAccessing = app.startAccessingSecurityScopedResource(bookmark) as () => void;
    securityScopedAccess.set(path, stopAccessing);
  } catch (error) {
    console.warn('[main] Failed to activate folder security bookmark:', error);
  }
}

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
        buttonLabel: 'Choose',
        message: 'Choose this folder for MorphFinder',
        securityScopedBookmarks: process.platform === 'darwin',
        properties: ['openDirectory', 'dontAddToRecent'],
      };
      const normalizedDefaultPath = await normalizeDialogDefaultPath(defaultPath);
      if (normalizedDefaultPath !== undefined) options.defaultPath = normalizedDefaultPath;

      const result = await dialog.showOpenDialog(window, options);
      if (result.canceled || result.filePaths.length === 0) return null;
      const selectedPath = result.filePaths[0] ?? null;
      if (selectedPath !== null) retainSecurityScopedAccess(selectedPath, result.bookmarks?.[0]);
      return selectedPath;
    },
  };
}
