/**
 * terminalServiceExtra.test.ts
 * Extra coverage for terminal session create, write, resize, and kill.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createTerminalSession,
  writeToTerminalSession,
  resizeTerminalSession,
  killTerminalSession,
} from '../../src/main/services/terminalService';

const mockWindow: any = {
  isDestroyed: vi.fn().mockReturnValue(false),
  webContents: { send: vi.fn() },
};

describe('terminalService extra coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a terminal session with valid cwd', () => {
    const result = createTerminalSession(mockWindow, process.cwd());
    expect(result.id).toMatch(/^term-/);
  });

  it('creates a terminal session with invalid cwd (falls back to homedir)', () => {
    const result = createTerminalSession(mockWindow, '/non/existent/path');
    expect(result.id).toMatch(/^term-/);
  });

  it('creates a terminal session with morph:// cwd', () => {
    const result = createTerminalSession(mockWindow, 'morph://files');
    expect(result.id).toMatch(/^term-/);
  });

  it('writes to a session with fallback command (no ptyProcess)', () => {
    const { id } = createTerminalSession(mockWindow, process.cwd());
    // Writes a simple echo command via fallback - this spawns a real child process (async)
    // so we cannot synchronously assert on send. Just verify no crash.
    expect(() => writeToTerminalSession(id, 'echo hello\n', mockWindow)).not.toThrow();
  });

  it('writes to a non-existent session does nothing', () => {
    writeToTerminalSession('non-existent-session', 'ls\n', mockWindow);
    expect(mockWindow.webContents.send).not.toHaveBeenCalled();
  });

  it('writes empty line emits prompt', () => {
    const { id } = createTerminalSession(mockWindow, process.cwd());
    writeToTerminalSession(id, '\n', mockWindow);
    expect(mockWindow.webContents.send).toHaveBeenCalled();
  });

  it('handles cd command in fallback mode', () => {
    const { id } = createTerminalSession(mockWindow, process.cwd());
    writeToTerminalSession(id, `cd ${process.cwd()}\n`, mockWindow);
    expect(mockWindow.webContents.send).toHaveBeenCalled();
  });

  it('handles cd with tilde', () => {
    const { id } = createTerminalSession(mockWindow, process.cwd());
    writeToTerminalSession(id, 'cd ~\n', mockWindow);
    expect(mockWindow.webContents.send).toHaveBeenCalled();
  });

  it('resizes non-existent session does nothing', () => {
    resizeTerminalSession('non-existent', 80, 24);
  });

  it('kills a terminal session', () => {
    const { id } = createTerminalSession(mockWindow, process.cwd());
    killTerminalSession(id);
    // After killing, writing to it does nothing
    writeToTerminalSession(id, 'ls\n', mockWindow);
    expect(mockWindow.webContents.send).not.toHaveBeenCalled();
  });

  it('kills a non-existent session does nothing', () => {
    killTerminalSession('non-existent-session');
  });
});
