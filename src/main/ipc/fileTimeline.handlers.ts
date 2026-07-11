import type { IpcContract } from '@shared/ipc/contract';
import { scanFileTimeline } from '../services/fileTimelineService';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

export function createFileTimelineHandlers(): {
  'timeline:scan': Handler<'timeline:scan'>;
} {
  return {
    'timeline:scan': (request) => scanFileTimeline(request),
  };
}
