import type { BrowserWindow } from 'electron';
import type { IpcContract } from '../../shared/ipc/contract';
import { webShareService } from '../services/webShareService';
import { generateCompliantQrSvgAsync } from '../services/qrGenerator';

export function createWebShareHandlers(proxyWindow: BrowserWindow) {
  return {
    'webshare:start': async ({ path, paths }: IpcContract['webshare:start']['request']) => {
      const targets = paths && paths.length > 0 ? paths : path ? [path] : [];
      return webShareService.startShare(targets, proxyWindow);
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
    'airshare:setFolder': async ({ path, paths }: IpcContract['airshare:setFolder']['request']) => {
      const targets = paths && paths.length > 0 ? paths : path ? [path] : [];
      return webShareService.startShare(targets, proxyWindow);
    },
    'airshare:toggleInbound': async ({ allowInbound }: IpcContract['airshare:toggleInbound']['request']) => {
      return webShareService.setAllowInbound(allowInbound, proxyWindow);
    },
    'airshare:getReceived': () => {
      return webShareService.getReceivedFiles();
    },
    'airshare:openReceivedFolder': async () => {
      return webShareService.openReceivedFolder();
    },
  };
}
