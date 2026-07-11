import type { BrowserWindow } from 'electron';
import type { IpcContract } from '@shared/ipc/contract';
import {
  createFolder,
  readDirectory,
  renameEntry,
  wellKnownDirectories,
} from '../services/fileSystemService';
import { runFileOperation } from '../services/fileOperationService';
import { watchDirectory } from '../services/watcherService';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

const activeUnwatchers = new Map<string, () => void>();

export function createFsHandlers(window: BrowserWindow): {
  'fs:readDirectory': Handler<'fs:readDirectory'>;
  'fs:rename': Handler<'fs:rename'>;
  'fs:createFolder': Handler<'fs:createFolder'>;
  'fs:operate': Handler<'fs:operate'>;
  'fs:wellKnownDirs': Handler<'fs:wellKnownDirs'>;
  'fs:watch': Handler<'fs:watch'>;
  'fs:unwatch': Handler<'fs:unwatch'>;
} {
  return {
    'fs:readDirectory': ({ path, includeHidden }) => readDirectory(path, includeHidden),
    'fs:rename': ({ path, newName }) => renameEntry(path, newName),
    'fs:createFolder': ({ parentPath, name }) => createFolder(parentPath, name),
    'fs:operate': async (request) => ({ operationId: await runFileOperation(request, window.webContents) }),
    'fs:wellKnownDirs': () => Promise.resolve(wellKnownDirectories()),
    'fs:watch': ({ path }) => {
      activeUnwatchers.get(path)?.();
      activeUnwatchers.set(path, watchDirectory(path, window.webContents));
    },
    'fs:unwatch': ({ path }) => {
      activeUnwatchers.get(path)?.();
      activeUnwatchers.delete(path);
    },
  };
}
