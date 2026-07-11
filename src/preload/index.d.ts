import type { IpcChannel, IpcEventChannel } from '@shared/ipc/contract';
/**
 * Generic typed bridge derived from IpcContract/IpcEvents — adding a channel to the
 * shared contract makes it callable here with zero changes to this file.
 */
declare const morphBridge: {
    invoke: (channel: IpcChannel, request: unknown) => Promise<unknown>;
    on: (channel: IpcEventChannel, listener: (payload: unknown) => void) => () => void;
};
export type MorphBridge = typeof morphBridge;
declare global {
    interface Window {
        morph: MorphBridge;
    }
}
export {};
