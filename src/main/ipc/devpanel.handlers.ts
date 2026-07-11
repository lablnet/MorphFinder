import type { IpcContract } from '@shared/ipc/contract';
import { scanProject, runScript } from '../services/devPanelService';

type Handler<C extends keyof IpcContract> = (
  request: IpcContract[C]['request'],
) => IpcContract[C]['response'] | Promise<IpcContract[C]['response']>;

export function createDevPanelHandlers(): {
  'devpanel:scan': Handler<'devpanel:scan'>;
  'devpanel:runScript': Handler<'devpanel:runScript'>;
} {
  return {
    'devpanel:scan': ({ path }) => scanProject(path),
    'devpanel:runScript': ({ cwd, command }) => runScript(cwd, command),
  };
}
