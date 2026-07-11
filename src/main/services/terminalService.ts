import { spawn, type ChildProcess } from 'node:child_process';
import { createRequire } from 'node:module';
import type { BrowserWindow } from 'electron';

const requireFn = createRequire(import.meta.url);

interface TerminalSession {
  id: string;
  process: ChildProcess | any; // ChildProcess or node-pty.IPty
  isPty: boolean;
}

const sessions = new Map<string, TerminalSession>();

function getShellPath(): { shell: string; args: string[] } {
  const platform = process.platform;
  if (platform === 'win32') {
    return { shell: 'powershell.exe', args: ['-NoLogo'] };
  } else if (platform === 'darwin') {
    // Spawn zsh in interactive mode so prompts and auto-echos work better
    return { shell: '/bin/zsh', args: ['-i'] };
  } else {
    return { shell: '/bin/bash', args: ['-i'] };
  }
}

export function createTerminalSession(window: BrowserWindow, cwd: string): { id: string } {
  const id = `term-${Math.random().toString(36).substring(2, 11)}`;
  const { shell, args } = getShellPath();

  // Try node-pty dynamic load
  let ptyProcess: any = null;
  let isPty = false;

  try {
    const pty = requireFn('node-pty');
    ptyProcess = pty.spawn(shell, args, {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd,
      env: process.env,
    });
    isPty = true;
  } catch {
    // node-pty not available, fallback to standard child_process
  }

  if (isPty && ptyProcess) {
    ptyProcess.onData((data: string) => {
      if (!window.isDestroyed()) {
        window.webContents.send('terminal:data', { id, data });
      }
    });

    ptyProcess.onExit(({ exitCode }: { exitCode: number }) => {
      if (!window.isDestroyed()) {
        window.webContents.send('terminal:exit', { id, exitCode });
      }
      sessions.delete(id);
    });

    sessions.set(id, { id, process: ptyProcess, isPty: true });
  } else {
    // Fallback: child_process.spawn
    // Merge process.env with TERM=xterm-256color to encourage colored output
    const shellEnv = {
      ...process.env,
      TERM: 'xterm-256color',
      FORCE_COLOR: '1',
    };

    const child = spawn(shell, args, {
      cwd,
      env: shellEnv,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    child.stdout?.on('data', (chunk: Buffer) => {
      if (!window.isDestroyed()) {
        window.webContents.send('terminal:data', { id, data: chunk.toString() });
      }
    });

    child.stderr?.on('data', (chunk: Buffer) => {
      if (!window.isDestroyed()) {
        window.webContents.send('terminal:data', { id, data: chunk.toString() });
      }
    });

    child.on('exit', (code) => {
      const exitCode = code ?? 0;
      if (!window.isDestroyed()) {
        window.webContents.send('terminal:exit', { id, exitCode });
      }
      sessions.delete(id);
    });

    sessions.set(id, { id, process: child, isPty: false });
  }

  return { id };
}

export function writeToTerminalSession(id: string, data: string): void {
  const session = sessions.get(id);
  if (!session) return;

  if (session.isPty) {
    session.process.write(data);
  } else {
    const child = session.process as ChildProcess;
    child.stdin?.write(data);
  }
}

export function resizeTerminalSession(id: string, cols: number, rows: number): void {
  const session = sessions.get(id);
  if (!session) return;

  if (session.isPty) {
    try {
      session.process.resize(cols, rows);
    } catch {
      // Ignore resize errors
    }
  }
}

export function killTerminalSession(id: string): void {
  const session = sessions.get(id);
  if (!session) return;

  if (session.isPty) {
    try {
      session.process.kill();
    } catch {
      // Ignore kill errors
    }
  } else {
    const child = session.process as ChildProcess;
    child.kill();
  }
  sessions.delete(id);
}
