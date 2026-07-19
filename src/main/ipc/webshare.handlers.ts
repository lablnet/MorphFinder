import type { BrowserWindow } from 'electron';
import type { IpcContract } from '../../shared/ipc/contract';
import { webShareService } from '../services/webShareService';
import { generateCompliantQrSvgAsync } from '../services/qrGenerator';

export function createWebShareHandlers(proxyWindow: BrowserWindow) {
  return {
    'webshare:start': async ({ path }: IpcContract['webshare:start']['request']) => {
      return webShareService.startShare(path, proxyWindow);
    },
    'webshare:stop': async ({ sessionId }: IpcContract['webshare:stop']['request']) => {
      return webShareService.stopShare(sessionId, proxyWindow);
    },
    'webshare:getActive': () => {
      return webShareService.getActiveShare();
    },
    'webshare:generateQr': async ({ text }: IpcContract['webshare:generateQr']['request']) => {
      const qrSvg = await generateCompliantQrSvgAsync(text);
      return { qrSvg };
    },
  };
}
