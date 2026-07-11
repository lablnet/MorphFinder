import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, resolve } from 'node:path';
import type { BrowserWindow } from 'electron';

interface TerminalSession {
  id: string;
  cwd: string;
  buffer: string;
  process: ChildProcess | null;
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

function runCommand(window: BrowserWindow, session: TerminalSession, command: string): void {
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

export function createTerminalSession(_window: BrowserWindow, cwd: string): { id: string } {
  const id = `term-${Math.random().toString(36).substring(2, 11)}`;
  sessions.set(id, {
    id,
    cwd: resolveTerminalCwd(cwd),
    buffer: '',
    process: null,
  });
  return { id };
}

export function writeToTerminalSession(id: string, data: string, window?: BrowserWindow): void {
  const session = sessions.get(id);
  if (!session || window === undefined) return;

  session.buffer += data.replace(/\r/g, '\n');
  const lines = session.buffer.split('\n');
  session.buffer = lines.pop() ?? '';
  for (const line of lines) {
    runCommand(window, session, line);
  }
}

export function resizeTerminalSession(_id: string, _cols: number, _rows: number): void {
  // No-op: the safe backend is command based, not a native PTY.
}

export function killTerminalSession(id: string): void {
  const session = sessions.get(id);
  if (!session) return;
  session.process?.kill();
  sessions.delete(id);
}
