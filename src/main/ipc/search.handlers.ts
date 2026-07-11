import type { IpcContract } from '@shared/ipc/contract';
import { searchFiles } from '../services/fileSearchService';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

export function createSearchHandlers(): {
  'search:files': Handler<'search:files'>;
} {
  return {
    'search:files': (request) => searchFiles(request),
  };
}
