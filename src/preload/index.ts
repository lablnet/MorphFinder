import type { IpcChannel, IpcEventChannel } from '@shared/ipc/contract';
import type { IpcRendererEvent, contextBridge as ContextBridge, ipcRenderer as IpcRenderer } from 'electron';

// Electron sandbox preloads run as classic scripts, so this bridge must avoid runtime ESM imports.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const electron = require('electron') as { contextBridge: typeof ContextBridge; ipcRenderer: typeof IpcRenderer };
const { contextBridge, ipcRenderer } = electron;

/**
 * Generic typed bridge derived from IpcContract/IpcEvents — adding a channel to the
 * shared contract makes it callable here with zero changes to this file.
 */
const morphBridge = {
  invoke: (channel: IpcChannel, request: unknown) => ipcRenderer.invoke(channel, request),
  on: (channel: IpcEventChannel, listener: (payload: unknown) => void) => {
    const subscription = (_event: IpcRendererEvent, payload: unknown): void => listener(payload);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
};

export type MorphBridge = typeof morphBridge;

contextBridge.exposeInMainWorld('morph', morphBridge);
