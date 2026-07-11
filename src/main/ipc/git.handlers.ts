import type { BrowserWindow } from 'electron';
import type { IpcContract } from '@shared/ipc/contract';
import { getGitStatus, getGitHistory } from '../services/gitService';

type GitHandlers = {
  'git:status': (
    req: IpcContract['git:status']['request']
  ) => Promise<IpcContract['git:status']['response']>;
  'git:history': (
    req: IpcContract['git:history']['request']
  ) => Promise<IpcContract['git:history']['response']>;
};

export function createGitHandlers(_window: BrowserWindow): GitHandlers {
  return {
    'git:status': async ({ path }) => {
      return getGitStatus(path);
    },
    'git:history': async ({ path }) => {
      return getGitHistory(path);
    },
  };
}
