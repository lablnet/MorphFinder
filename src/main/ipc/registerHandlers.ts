import { ipcMain, type BrowserWindow } from 'electron';
import type { IpcChannel, IpcContract } from '@shared/ipc/contract';
import { createFsHandlers } from './fs.handlers';
import { createShellHandlers } from './shell.handlers';
import { createNativeHandlers } from './native.handlers';

type Handler<C extends IpcChannel> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

/** Requiring every IpcChannel key here is what makes a missing handler a compile
 *  error rather than a silent runtime "no handler registered" failure. */
type HandlerMap = { [C in IpcChannel]: Handler<C> };

export function registerHandlers(window: BrowserWindow): void {
  const handlers: HandlerMap = {
    ...createFsHandlers(window),
    ...createShellHandlers(window),
    ...createNativeHandlers(),
  };

  for (const channel of Object.keys(handlers) as IpcChannel[]) {
    // Single, intentional boundary cast: each handler is correctly typed at its
    // definition site above; the dispatch loop itself is necessarily channel-generic.
    const dispatch = handlers[channel] as (request: unknown) => unknown;
    ipcMain.handle(channel, (_event, request: unknown) => dispatch(request));
  }
}
