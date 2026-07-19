import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, resolve } from 'node:path';
import { createRequire } from 'node:module';
import type { BrowserWindow } from 'electron';

interface IPty {
  onData: (listener: (data: string) => void) => void;
  onExit: (listener: (e: { exitCode: number }) => void) => void;
  write: (data: string) => void;
  resize: (cols: number, rows: number) => void;
  kill: () => void;
}

interface NodePtyModule {
  spawn: (file: string, args: string[], options: Record<string, unknown>) => IPty;
}

const requireFn = createRequire(import.meta.url);
let ptyModule: NodePtyModule | null = null;
try {
  ptyModule = requireFn('node-pty') as NodePtyModule;
} catch {
  ptyModule = null;
}

interface TerminalSession {
  id: string;
  cwd: string;
  buffer: string;
  process: ChildProcess | null;
  ptyProcess: IPty | null;
}

const sessions = new Map<string, TerminalSession>();

function resolveTerminalCwd(cwd: string): string {
  if (!cwd || cwd.startsWith('morph://')) return homedir();
  try {
    if (!existsSync(cwd)) return homedir();
    const details = statSync(cwd);
    return details.isDirectory() ? cwd : homedir();
  } catch {
    return homedir();
  }
}

function emitData(window: BrowserWindow, id: string, data: string): void {
  if (!window.isDestroyed()) {
    window.webContents.send('terminal:data', { id, data });
  }
}

function defaultShell(): string {
  if (process.platform === 'win32') return 'powershell.exe';
  return process.platform === 'darwin' ? '/bin/zsh' : '/bin/bash';
}

function shellCommand(command: string): { shell: string; args: string[] } {
  if (process.platform === 'win32') {
    return { shell: 'powershell.exe', args: ['-NoLogo', '-NoProfile', '-Command', command] };
  }
  const shell = process.platform === 'darwin' ? '/bin/zsh' : '/bin/bash';
  return { shell, args: ['-lc', command] };
}

function parseCdTarget(command: string): string | null {
  const match = /^cd(?:\s+(.+))?$/.exec(command.trim());
  if (!match) return null;
  const rawTarget = match[1]?.trim();
  if (!rawTarget || rawTarget === '~') return homedir();
  return rawTarget.replace(/^["']|["']$/g, '');
}

function changeDirectory(session: TerminalSession, target: string): string {
  const nextPath = resolveTerminalCwd(isAbsolute(target) ? target : resolve(session.cwd, target));
  session.cwd = nextPath;
  return nextPath;
}

function runFallbackCommand(window: BrowserWindow, session: TerminalSession, command: string): void {
  const trimmed = command.trim();
  if (trimmed.length === 0) {
    emitData(window, session.id, '$ ');
    return;
  }

  if (session.process !== null) {
    emitData(window, session.id, 'A command is already running.\r\n$ ');
    return;
  }

  const cdTarget = parseCdTarget(trimmed);
  if (cdTarget !== null) {
    emitData(window, session.id, `${changeDirectory(session, cdTarget)}\r\n$ `);
    return;
  }

  const { shell, args } = shellCommand(trimmed);
  const child = spawn(shell, args, {
    cwd: session.cwd,
    env: { ...process.env, TERM: 'xterm-256color', FORCE_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  session.process = child;

  child.stdout?.on('data', (chunk: Buffer) => emitData(window, session.id, chunk.toString()));
  child.stderr?.on('data', (chunk: Buffer) => emitData(window, session.id, chunk.toString()));
  child.on('error', (error) => {
    emitData(window, session.id, `Command failed: ${error.message}\r\n$ `);
    session.process = null;
  });
  child.on('exit', () => {
    session.process = null;
    emitData(window, session.id, '\r\n$ ');
  });
}

export function createTerminalSession(window: BrowserWindow, cwd: string): { id: string } {
  const id = `term-${Math.random().toString(36).substring(2, 11)}`;
  const validCwd = resolveTerminalCwd(cwd);

  let ptyProc: IPty | null = null;
  if (ptyModule !== null) {
    try {
      const shell = defaultShell();
      ptyProc = ptyModule.spawn(shell, [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        cwd: validCwd,
        env: process.env,
      });

      ptyProc.onData((data: string) => emitData(window, id, data));
      ptyProc.onExit(() => {
        if (!window.isDestroyed()) {
          window.webContents.send('terminal:exit', { id, exitCode: 0 });
        }
      });
    } catch {
      ptyProc = null;
    }
  }

  sessions.set(id, {
    id,
    cwd: validCwd,
    buffer: '',
    process: null,
    ptyProcess: ptyProc,
  });

  return { id };
}

export function writeToTerminalSession(id: string, data: string, window?: BrowserWindow): void {
  const session = sessions.get(id);
  if (!session) return;

  if (session.ptyProcess !== null) {
    session.ptyProcess.write(data);
    return;
  }

  if (window === undefined) return;

  session.buffer += data.replace(/\r/g, '\n');
  const lines = session.buffer.split('\n');
  session.buffer = lines.pop() ?? '';
  for (const line of lines) {
    runFallbackCommand(window, session, line);
  }
}

export function resizeTerminalSession(id: string, cols: number, rows: number): void {
  const session = sessions.get(id);
  if (!session || session.ptyProcess === null) return;
  try {
    session.ptyProcess.resize(cols, rows);
  } catch {
    // Ignore invalid resize parameters
  }
}

export function killTerminalSession(id: string): void {
  const session = sessions.get(id);
  if (!session) return;
  if (session.ptyProcess !== null) {
    session.ptyProcess.kill();
  } else if (session.process !== null) {
    session.process.kill();
  }
  sessions.delete(id);
}

