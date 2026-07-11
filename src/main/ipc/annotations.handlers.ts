import type { IpcContract } from '@shared/ipc/contract';
import { getDirectoryAnnotation, setDirectoryAnnotation, listDirectoryAnnotations } from '../services/directoryAnnotationService';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

export function createAnnotationHandlers(): {
  'annotations:get': Handler<'annotations:get'>;
  'annotations:set': Handler<'annotations:set'>;
  'annotations:list': Handler<'annotations:list'>;
} {
  return {
    'annotations:get': ({ path }) => getDirectoryAnnotation(path),
    'annotations:set': (request) => setDirectoryAnnotation(request),
    'annotations:list': () => listDirectoryAnnotations(),
  };
}
