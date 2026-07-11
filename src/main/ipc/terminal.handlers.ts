import type { BrowserWindow } from 'electron';
import type { IpcContract } from '@shared/ipc/contract';
import {
  createTerminalSession,
  writeToTerminalSession,
  resizeTerminalSession,
  killTerminalSession,
} from '../services/terminalService';

type TerminalHandlers = {
  'terminal:create': (
    req: IpcContract['terminal:create']['request']
  ) => IpcContract['terminal:create']['response'];
  'terminal:write': (
    req: IpcContract['terminal:write']['request']
  ) => IpcContract['terminal:write']['response'];
  'terminal:resize': (
    req: IpcContract['terminal:resize']['request']
  ) => IpcContract['terminal:resize']['response'];
  'terminal:kill': (
    req: IpcContract['terminal:kill']['request']
  ) => IpcContract['terminal:kill']['response'];
};

export function createTerminalHandlers(window: BrowserWindow): TerminalHandlers {
  return {
    'terminal:create': ({ cwd }) => {
      return createTerminalSession(window, cwd);
    },
    'terminal:write': ({ id, data }) => {
      writeToTerminalSession(id, data, window);
    },
    'terminal:resize': ({ id, cols, rows }) => {
      resizeTerminalSession(id, cols, rows);
    },
    'terminal:kill': ({ id }) => {
      killTerminalSession(id);
    },
  };
}
