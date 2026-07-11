import type { IpcContract } from '@shared/ipc/contract';
import { scanCaches, cleanCaches } from '../services/cacheCleanerService';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

export function createCacheHandlers(): {
  'cache:scan': Handler<'cache:scan'>;
  'cache:clean': Handler<'cache:clean'>;
} {
  return {
    'cache:scan': () => scanCaches(),
    'cache:clean': ({ targetIds }) => cleanCaches(targetIds),
  };
}
