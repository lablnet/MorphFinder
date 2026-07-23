import { ipcMain, BrowserWindow } from 'electron';
import type { IpcChannel, IpcContract } from '@shared/ipc/contract';
import { AsyncLocalStorage } from 'node:async_hooks';
import { createFsHandlers } from './fs.handlers';
import { createShellHandlers } from './shell.handlers';
import { createNativeHandlers } from './native.handlers';
import { createCacheHandlers } from './cache.handlers';
import { createAnalyzerHandlers } from './analyzer.handlers';
import { createGitHandlers } from './git.handlers';
import { createTerminalHandlers } from './terminal.handlers';
import { createDevPanelHandlers } from './devpanel.handlers';
import { createAnnotationHandlers } from './annotations.handlers';
import { createSearchHandlers } from './search.handlers';
import { createSmartCollectionsHandlers } from './smartCollections.handlers';
import { createDuplicateHandlers } from './duplicates.handlers';
import { createFileTimelineHandlers } from './fileTimeline.handlers';
import { createSnapshotHandlers } from './snapshots.handlers';
import { createArchiveHandlers } from './archive.handlers';

type Handler<C extends IpcChannel> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

type HandlerMap = { [C in IpcChannel]: Handler<C> };

// Thread-safe storage to keep track of which window sent the current IPC request
export const ipcWindowStore = new AsyncLocalStorage<BrowserWindow>();

// A proxy window passed to all handlers that dynamically forwards calls to the actual sender window
export const proxyWindow = new Proxy({} as BrowserWindow, {
  get(_, prop) {
    const activeWin =
      ipcWindowStore.getStore() ||
      BrowserWindow?.getFocusedWindow?.() ||
      BrowserWindow?.getAllWindows?.()?.[0];

    if (!activeWin) return undefined;
    const value = activeWin[prop];
    if (typeof value === 'function') {
      return value.bind(activeWin);
    }
    return value;
  },
});

export function registerHandlers(): void {
  const handlers: HandlerMap = {
    ...createFsHandlers(proxyWindow),
    ...createShellHandlers(proxyWindow),
    ...createNativeHandlers(),
    ...createCacheHandlers(),
    ...createAnalyzerHandlers(proxyWindow),
    ...createGitHandlers(proxyWindow),
    ...createTerminalHandlers(proxyWindow),
    ...createDevPanelHandlers(),
    ...createAnnotationHandlers(),
    ...createSearchHandlers(),
    ...createSmartCollectionsHandlers(),
    ...createDuplicateHandlers(proxyWindow),
    ...createFileTimelineHandlers(),
    ...createSnapshotHandlers(),
    ...createArchiveHandlers(proxyWindow),
  };

  for (const channel of Object.keys(handlers) as IpcChannel[]) {
    const dispatch = handlers[channel] as (request: unknown) => unknown;
    ipcMain.handle(channel, (event, request: unknown) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        return ipcWindowStore.run(window, () => dispatch(request));
      }
      return dispatch(request);
    });
  }
}
