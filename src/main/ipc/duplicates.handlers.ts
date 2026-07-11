import type { IpcContract } from '@shared/ipc/contract';
import type { BrowserWindow } from 'electron';
import { cancelDuplicateScan, scanDuplicates } from '../services/duplicateFinderService';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

export function createDuplicateHandlers(window: BrowserWindow): {
  'duplicates:scan': Handler<'duplicates:scan'>;
  'duplicates:cancel': Handler<'duplicates:cancel'>;
} {
  return {
    'duplicates:scan': (request) => scanDuplicates(request, (progress) => {
      if (!window.webContents.isDestroyed()) window.webContents.send('duplicates:progress', progress);
    }),
    'duplicates:cancel': () => {
      cancelDuplicateScan();
    },
  };
}
