import type { IpcContract } from '@shared/ipc/contract';
import { getNativeMetadata, getNativeThumbnail, getOpenWithApps, getSystemLocations, nativeCapabilities, setNativeTags } from '../services/nativeBridge';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

export function createNativeHandlers(): {
  'native:capabilities': Handler<'native:capabilities'>;
  'native:getLocations': Handler<'native:getLocations'>;
  'native:metadata': Handler<'native:metadata'>;
  'native:setTags': Handler<'native:setTags'>;
  'native:thumbnail': Handler<'native:thumbnail'>;
  'native:openWithApps': Handler<'native:openWithApps'>;
} {
  return {
    'native:capabilities': () => Promise.resolve(nativeCapabilities()),
    'native:getLocations': () => Promise.resolve(getSystemLocations()),
    'native:metadata': ({ path }) => Promise.resolve(getNativeMetadata(path)),
    'native:setTags': ({ path, tags }) => Promise.resolve(setNativeTags(path, tags)),
    'native:thumbnail': ({ path, width, height, scale }) => Promise.resolve(getNativeThumbnail(path, width, height, scale)),
    'native:openWithApps': ({ path }) => Promise.resolve(getOpenWithApps(path)),
  };
}
