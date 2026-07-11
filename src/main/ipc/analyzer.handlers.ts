import type { BrowserWindow } from 'electron';
import type { IpcContract } from '@shared/ipc/contract';
import { scanDirectorySize, abortScan } from '../services/spaceAnalyzerService';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

export function createAnalyzerHandlers(window: BrowserWindow): {
  'analyzer:scan': Handler<'analyzer:scan'>;
  'analyzer:cancel': Handler<'analyzer:cancel'>;
} {
  return {
    'analyzer:scan': ({ path }) =>
      scanDirectorySize(path, (scannedPath, fileCount, size) => {
        if (!window.isDestroyed()) {
          window.webContents.send('analyzer:progress', {
            scannedPath,
            fileCount,
            size,
          });
        }
      }),
    'analyzer:cancel': () => {
      abortScan();
    },
  };
}
