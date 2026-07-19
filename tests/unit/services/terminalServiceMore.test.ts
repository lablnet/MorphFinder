import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createTerminalSession,
  killTerminalSession,
  resizeTerminalSession,
  writeToTerminalSession,
} from '../../../src/main/services/terminalService';

let root: string;

function makeWindow() {
  return {
    isDestroyed: vi.fn(() => false),
    webContents: {
      send: vi.fn(),
    },
  } as any;
}

describe('terminal service fallback behavior', () => {
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'morph-terminal-'));
    await mkdir(join(root, 'subdir'));
    await writeFile(join(root, 'file.txt'), 'not a directory');
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('creates sessions with safe cwd resolution and handles built-in fallback commands', () => {
    const window = makeWindow();
    const { id } = createTerminalSession(window, root);
    expect(id).toMatch(/^term-/);

    writeToTerminalSession(id, '\n', window);
    writeToTerminalSession(id, `cd "subdir"\n`, window);
    writeToTerminalSession(id, 'cd ~\n', window);
    writeToTerminalSession(id, 'partial command');
    writeToTerminalSession(id, '\n', window);
    writeToTerminalSession('missing', 'ignored\n', window);
    writeToTerminalSession(id, 'ignored without window\n');
    resizeTerminalSession(id, 100, 30);
    killTerminalSession(id);
    killTerminalSession(id);

    const sent = window.webContents.send.mock.calls.map((call: any[]) => call[1]?.data ?? '').join('');
    expect(sent).toContain('$ ');
    expect(sent).toContain(join(root, 'subdir'));
  });

  it('falls back to home for invalid cwd and does not emit to destroyed windows', () => {
    const destroyedWindow = makeWindow();
    destroyedWindow.isDestroyed.mockReturnValue(true);
    const { id } = createTerminalSession(destroyedWindow, join(root, 'file.txt'));
    writeToTerminalSession(id, '\n', destroyedWindow);
    expect(destroyedWindow.webContents.send).not.toHaveBeenCalled();
    killTerminalSession(id);

    const virtual = createTerminalSession(makeWindow(), 'morph://cache');
    killTerminalSession(virtual.id);
  });
});
