import type { BrowserWindow } from 'electron';
import { archiveService } from '../services/archiveService';
import type { IpcContract } from '@shared/ipc/contract';

type ArchiveHandlers = Pick<IpcContract, 'archive:compress' | 'archive:extract' | 'archive:list' | 'archive:cancel'>;

type Handlers = {
  [K in keyof ArchiveHandlers]: (
    req: ArchiveHandlers[K]['request'],
  ) => Promise<ArchiveHandlers[K]['response']>;
};

export function createArchiveHandlers(window: BrowserWindow): Handlers {
  return {
    'archive:compress': async ({ paths, destinationZipPath }) => {
      return await archiveService.compress(window, paths, destinationZipPath);
    },
    'archive:extract': async ({ archivePath, destinationDir }) => {
      return await archiveService.extract(archivePath, destinationDir);
    },
    'archive:list': async ({ archivePath }) => {
      return await archiveService.listEntries(archivePath);
    },
    'archive:cancel': async ({ operationId }) => {
      archiveService.cancel(operationId);
    },
  };
}
