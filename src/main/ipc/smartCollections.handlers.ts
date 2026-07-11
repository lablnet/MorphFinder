import type { IpcContract } from '@shared/ipc/contract';
import { scanSmartCollection } from '../services/smartCollectionsService';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

export function createSmartCollectionsHandlers(): {
  'smartCollections:scan': Handler<'smartCollections:scan'>;
} {
  return {
    'smartCollections:scan': (request) => scanSmartCollection(request),
  };
}
