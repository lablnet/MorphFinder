import type { IpcChannel, IpcEventChannel, IpcEvents, IpcRequest, IpcResponse } from '@shared/ipc/contract';

/** Re-adds the type safety erased at the contextBridge boundary — every call site
 *  in the renderer goes through this, never `window.morph` directly. */
export const ipc = {
  invoke<C extends IpcChannel>(channel: C, request: IpcRequest<C>): Promise<IpcResponse<C>> {
    return window.morph.invoke(channel, request) as Promise<IpcResponse<C>>;
  },

  on<E extends IpcEventChannel>(channel: E, listener: (payload: IpcEvents[E]) => void): () => void {
    return window.morph.on(channel, listener as (payload: unknown) => void);
  },
};
