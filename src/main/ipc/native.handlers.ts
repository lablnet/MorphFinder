import type { IpcContract } from '@shared/ipc/contract';
import { getNativeMetadata, getNativeThumbnail, getOpenWithApps, nativeCapabilities, setNativeTags } from '../services/nativeBridge';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

export function createNativeHandlers(): {
  'native:capabilities': Handler<'native:capabilities'>;
  'native:metadata': Handler<'native:metadata'>;
  'native:setTags': Handler<'native:setTags'>;
  'native:thumbnail': Handler<'native:thumbnail'>;
  'native:openWithApps': Handler<'native:openWithApps'>;
} {
  return {
    'native:capabilities': () => Promise.resolve(nativeCapabilities()),
    'native:metadata': ({ path }) => Promise.resolve(getNativeMetadata(path)),
    'native:setTags': ({ path, tags }) => Promise.resolve(setNativeTags(path, tags)),
    'native:thumbnail': ({ path, width, height, scale }) => Promise.resolve(getNativeThumbnail(path, width, height, scale)),
    'native:openWithApps': ({ path }) => Promise.resolve(getOpenWithApps(path)),
  };
}
